import json
import os
from flask import Flask, render_template, request, redirect, url_for, session, jsonify
import mysql.connector
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from predict import predict_monument

app = Flask(__name__)
app.secret_key = 'monument_identification_super_secret_key'
app.config['UPLOAD_FOLDER'] = './uploads'
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg'}

# Database connection helper
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="yourpassword",
        database="monument_db"
    )

def allowed_file(filename):
    return '.' in filename and filename.split('.')[-1].lower() in app.config['ALLOWED_EXTENSIONS']


def load_class_labels():
    label_path = os.path.join('model', 'class_labels.json')
    if os.path.exists(label_path):
        with open(label_path, 'r', encoding='utf-8') as label_file:
            return json.load(label_file)
    return None


@app.route('/')
def home():
    if 'user_id' in session:
        return redirect(url_for('dashboard'))
    return render_template('login.html')

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        db = get_db_connection()
        cursor = db.cursor()
        
        # Check if username exists
        cursor.execute("SELECT id FROM users WHERE username = %s", (username,))
        if cursor.fetchone():
            cursor.close()
            db.close()
            return "Username already exists!", 400
            
        p_hash = generate_password_hash(password)
        cursor.execute("INSERT INTO users (username, password_hash) VALUES (%s, %s)", (username, p_hash))
        db.commit()
        
        cursor.close()
        db.close()
        return redirect(url_for('home'))
    return render_template('signup.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)
        
        cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
        user = cursor.fetchone()
        
        if user and check_password_hash(user['password_hash'], password):
            session['user_id'] = user['id']
            session['username'] = user['username']
            session['role'] = user['role']
            cursor.close()
            db.close()
            return redirect(url_for('dashboard'))
            
        cursor.close()
        db.close()
        return "Invalid Credentials", 401
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('home'))

@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        return redirect(url_for('home'))
    return render_template('dashboard.html', username=session['username'])

@app.route('/predict', methods=['POST'])
def run_prediction():
    if 'user_id' not in session:
        return jsonify({"error": "Unauthorized"}), 401
        
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
        
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # CNN Model settings
        class_labels = load_class_labels() or ['Taj Mahal', 'India Gate', 'Qutub Minar', 'Eiffel Tower']
        model_path = './model/monument_efficientnet.h5'
        
        try:
            predicted_name, confidence = predict_monument(filepath, model_path, class_labels)
            
            # Retrieve historical details from MySQL database
            db = get_db_connection()
            cursor = db.cursor(dictionary=True)
            cursor.execute("SELECT * FROM monuments WHERE monument_name = %s", (predicted_name,))
            monument_info = cursor.fetchone()
            
            if not monument_info:
                monument_info = {
                    "monument_name": predicted_name,
                    "location": "Unknown Location",
                    "history": "No database documentation available.",
                    "architecture": "N/A",
                    "famous_facts": "[]"
                }
            
            # Save predictions history
            cursor.execute(
                "INSERT INTO predictions (user_id, image_name, predicted_monument, confidence_score) VALUES (%s, %s, %s, %s)",
                (session['user_id'], filename, predicted_name, float(confidence))
            )
            db.commit()
            
            cursor.close()
            db.close()
            
            return jsonify({
                "status": "success",
                "predicted_name": predicted_name,
                "confidence": float(confidence),
                "details": monument_info
            })
            
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 500
            
    return jsonify({"error": "Invalid file extension"}), 400

if __name__ == '__main__':
    # Run the application on port 3000 as configured for custom platform binding
    app.run(host='127.0.0.1', port=3000)
