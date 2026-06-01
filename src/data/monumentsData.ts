import { DatasetCategory, ModelLayer, PreprocessingStep, Monument } from "../types";

export const STATIC_PREPROCESSING_STEPS: PreprocessingStep[] = [
  {
    name: "BGR to RGB Color Conversion",
    description: "OpenCV reads images in BGR pixel channel ordering by default. Converts the image array to RGB standard format to align color representations prior to neural node feeds.",
    outputSize: "224 x 224 x 3",
    status: "success"
  },
  {
    name: "OpenCV Bilateral Noise Filtering",
    description: "Applies a bilateral filter for smoothing while preserving sharp architectural boundaries and brick mortar edges, eliminating compression noise and light aberrations.",
    outputSize: "224 x 224 x 3",
    status: "success"
  },
  {
    name: "Bilinear Image Rescaling",
    description: "Downsamples or upsamples the input raw photograph to exactly 224 x 224 pixel matrix to match the input layer dimensions of the CNN and EfficientNet feature extractors.",
    outputSize: "224 x 224 x 3",
    status: "success"
  },
  {
    name: "Pixel Float Normalization",
    description: "Divides each RGB channel integer value [0-255] by 255.0 to map inputs into floats in the range [0.0, 1.0]. This standardizes neural weight activations and prevents steep gradients.",
    outputSize: "224 x 224 x 3",
    status: "success"
  },
  {
    name: "Batch Dimension Expansion",
    description: "Appends an artificial batch dimension to the tensor to match standard TensorFlow Keras input shapes: (Batch, Height, Width, Channels) -> (1, 224, 224, 3).",
    outputSize: "1 x 224 x 224 x 3",
    status: "success"
  }
];

export const CNN_LAYERS: ModelLayer[] = [
  {
    layerName: "Input Layer",
    type: "InputTensor",
    outputShape: "(None, 224, 224, 3)",
    params: 0,
    purpose: "Receives raw 224x224 RGB normalized pixel arrays"
  },
  {
    layerName: "Conv2D (Feature Extraction)",
    type: "Conv2D (3x3 Filters)",
    outputShape: "(None, 222, 222, 32)",
    params: 896,
    purpose: "Extracts basic geometric filters like edges, angles, arches, and high-frequency boundaries"
  },
  {
    layerName: "ReLU Activation",
    type: "Activation (Non-linear)",
    outputShape: "(None, 222, 222, 32)",
    params: 0,
    purpose: "Introduces non-linear thresholding, converting negative activations to zero"
  },
  {
    layerName: "MaxPooling2D",
    type: "MaxPooling (2x2 Pool)",
    outputShape: "(None, 111, 111, 32)",
    params: 0,
    purpose: "Reduces spatial dimension matrix size by half to downsample features and prevent scale errors"
  },
  {
    layerName: "EfficientNetB0 Core",
    type: "Mobile Inverted Bottleneck (MBConv)",
    outputShape: "(None, 7, 7, 1280)",
    params: 4049564,
    purpose: "Pretrained ImageNet backbone capturing deep architectural combinations and textures"
  },
  {
    layerName: "GlobalAveragePooling2D",
    type: "GlobalAvgPooling",
    outputShape: "(None, 1280)",
    params: 0,
    purpose: "Collapses height & width dimensions into a single flat vector by calculation of spatial mean values"
  },
  {
    layerName: "Dense Layer (ReLU)",
    type: "Fully Connected",
    outputShape: "(None, 512)",
    params: 655872,
    purpose: "High-level feature combiner compiling complex monument architectural style features"
  },
  {
    layerName: "Dropout (Rate = 0.5)",
    type: "Regularization Layer",
    outputShape: "(None, 512)",
    params: 0,
    purpose: "Randomly deactivates 50% of neurone pathways during train passes to prevent severe overfitting"
  },
  {
    layerName: "Output Predictions (Softmax)",
    type: "Dense Classifications",
    outputShape: "(None, 6)",
    params: 3078,
    purpose: "Computes mutually exclusive probability percentages across all classified monument categories"
  }
];

export const MOCK_STARTER_HISTORY = [
  {
    id: "hist-1",
    timestamp: "2026-05-31T12:45:00.000Z",
    imageName: "taj_visit_temp.jpg",
    imageBytes: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&q=80&w=400",
    detectedName: "Taj Mahal",
    confidence: 98.42,
    location: "Agra, Uttar Pradesh, India",
    classificationTimeMs: 730
  },
  {
    id: "hist-2",
    timestamp: "2026-05-31T09:12:00.000Z",
    imageName: "eiffel_dusk_shots.png",
    imageBytes: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=400",
    detectedName: "Eiffel Tower",
    confidence: 96.11,
    location: "Champ de Mars, Paris, France",
    classificationTimeMs: 820
  }
];

export const FULL_PYTHON_CODELIST = {
  "app.py": `from flask import Flask, render_template, request, redirect, url_for, session, json, jsonify
import mysql.connector
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import os
from predict import predict_monument

app = Flask(__name__)
app.secret_key = 'monument_identification_super_secret_key'
app.config['UPLOAD_FOLDER'] = './uploads'
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg'}

# Relational MySQL connection pooling
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="yourpassword",
        database="monument_db"
    )

def allowed_file(filename):
    return '.' in filename and filename.split('.')[-1].lower() in app.config['ALLOWED_EXTENSIONS']

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

@app.route('/predict', methods=['POST'])
def run_prediction():
    if 'user_id' not in session:
        return jsonify({"error": "Unauthorized"}), 401
        
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
        
    file = request.files['file']
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Deep CNN parameters
        class_labels = ['Taj Mahal', 'India Gate', 'Eiffel Tower', 'Colosseum', 'Machu Picchu']
        model_path = './model/monument_efficientnet.h5'
        
        try:
            predicted_name, confidence = predict_monument(filepath, model_path, class_labels)
            
            # Fetch relational detailed metrics
            db = get_db_connection()
            cursor = db.cursor(dictionary=True)
            cursor.execute("SELECT * FROM monuments WHERE monument_name = %s", (predicted_name,))
            mon_details = cursor.fetchone()
            
            cursor.close()
            db.close()
            
            return jsonify({
                "status": "success",
                "predicted_name": predicted_name,
                "confidence": float(confidence),
                "details": mon_details
            })
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 500
    return jsonify({"error": "Invalid format"}), 400

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=3000)`,

  "train_model.py": `import os
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import EfficientNetB0
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
import matplotlib.pyplot as plt

DATASET_DIR = './dataset'
MODEL_SAVE_PATH = './model/monument_efficientnet.h5'

# Data Augmentation Setup
train_datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=20,
    width_shift_range=0.2,
    height_shift_range=0.2,
    shear_range=0.2,
    zoom_range=0.2,
    horizontal_flip=True,
    fill_mode='nearest',
    validation_split=0.2
)

train_generator = train_datagen.flow_from_directory(
    DATASET_DIR, target_size=(224, 224), batch_size=32, class_mode='categorical', subset='training'
)
val_generator = train_datagen.flow_from_directory(
    DATASET_DIR, target_size=(224, 224), batch_size=32, class_mode='categorical', subset='validation'
)

# Leverage Transfer Learning via ImageNet weights
print("Loading Pretrained EfficientNetB0...")
base_model = EfficientNetB0(weights='imagenet', include_top=False, input_shape=(224, 224, 3))
base_model.trainable = False  # Freeze convolutional backbone

x = base_model.output
x = GlobalAveragePooling2D()(x)
x = Dense(512, activation='relu')(x)
x = Dropout(0.5)(x)
predictions = Dense(train_generator.num_classes, activation='softmax')(x)

model = Model(inputs=base_model.input, outputs=predictions)
model.compile(optimizer=Adam(lr=0.001), loss='categorical_crossentropy', metrics=['accuracy'])

# Train classifier head
history = model.fit(train_generator, epochs=15, validation_data=val_generator)
model.save(MODEL_SAVE_PATH)
print("Classification Model training successfully completed!")`,

  "predict.py": `import cv2
import numpy as np
import tensorflow as tf

def preprocess_image(image_path):
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError("Invalid image file path")
        
    # Resize and alter colors
    img = cv2.resize(img, (224, 224))
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    # Bilateral smoothing noise filter
    img = cv2.fastNlMeansDenoisingColored(img, None, 10, 10, 7, 21)
    
    # Scale float
    img = img.astype(np.float32) / 255.0
    return np.expand_dims(img, axis=0) # Shape: (1, 224, 224, 3)

def predict_monument(image_path, model_path, class_labels):
    processed = preprocess_image(image_path)
    model = tf.keras.models.load_model(model_path)
    probs = model.predict(processed)
    idx = np.argmax(probs[0])
    return class_labels[idx], probs[0][idx]`,

  "requirements.txt": `Flask==2.3.3
tensorflow==2.13.0
keras==2.13.1
opencv-python-headless==4.8.0.76
numpy==1.24.3
mysql-connector-python==8.0.33
Werkzeug==2.3.7
scikit-learn==1.3.0
matplotlib==3.7.2
gunicorn==20.1.0`,

  "database.sql": `CREATE DATABASE IF NOT EXISTS monument_db;
USE monument_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS monuments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    monument_name VARCHAR(150) NOT NULL,
    location VARCHAR(150),
    built_by VARCHAR(150),
    architecture VARCHAR(150),
    history TEXT,
    famous_facts TEXT,
    image_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS predictions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    image_name VARCHAR(255),
    predicted_monument VARCHAR(150),
    confidence_score FLOAT,
    predictions_json TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);`
};
