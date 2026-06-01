# Monument Identification System

<div align="center">

![Monument Identification](https://img.shields.io/badge/AI-Monument%20Recognition-blue)
![Python](https://img.shields.io/badge/Python-3.9+-brightgreen)
![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react)
![License](https://img.shields.io/badge/License-MIT-green)

An advanced machine learning system for identifying Indian monuments from images using deep learning and computer vision.

[Demo](#demo) • [Features](#features) • [Installation](#installation) • [Usage](#usage) • [Project Structure](#project-structure)

</div>

---

## Overview

The Monument Identification System is a full-stack application that uses **Convolutional Neural Networks (CNNs)** to identify and classify Indian monuments from uploaded images. The project combines a **Python/Flask backend** with machine learning capabilities and a **React/TypeScript frontend** with modern UI components.

### Key Capabilities
- 🏛️ Identifies 20+ Indian monuments
- 📸 Real-time image classification
- 🎯 High accuracy deep learning model
- 🌐 Web-based user interface
- 📊 Detailed monument information and metadata
- 🔐 User authentication system
- 💾 MySQL database for storing results

---

## Features

- **AI-Powered Monument Recognition**: Uses TensorFlow/Keras CNN model trained on Indian monument dataset
- **User Authentication**: Secure login and registration system
- **Image Upload & Analysis**: Upload monument images for instant identification
- **Detailed Monument Information**: View comprehensive details about identified monuments
- **Result History**: Track all previous identification results
- **Responsive UI**: Modern, intuitive interface built with React and Tailwind CSS
- **RESTful API**: Clean backend API for seamless frontend-backend communication

---

## Tech Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool
- **Tailwind CSS** - Styling
- **Lucide React** - Icon library

### Backend
- **Python 3.9+** - Core language
- **Flask** - Web framework
- **TensorFlow/Keras** - Deep learning
- **OpenCV** - Image processing
- **MySQL** - Database
- **Node.js/Express** - API server

### ML/AI
- **TensorFlow 2.13** - Neural networks
- **Keras** - High-level API
- **scikit-learn** - ML utilities
- **NumPy** - Numerical computing

---

## Installation

### Prerequisites

- **Node.js** 16+ and npm
- **Python** 3.9+
- **MySQL** 8.0+
- **pip** - Python package manager

### Frontend Setup

1. Install Node.js dependencies:
   ```bash
   npm install
   ```

2. Configure environment:
   ```bash
   cp .env.local.example .env.local
   ```
   Set your Gemini API key in `.env.local`:
   ```
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

3. Run development server:
   ```bash
   npm run dev
   ```

### Backend Setup

1. Navigate to the Python project:
   ```bash
   cd monument_project
   ```

2. Create virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up MySQL database:
   ```bash
   mysql -u root -p < database.sql
   ```

5. Update database credentials in `app.py`:
   ```python
   host="localhost",
   user="root",
   password="your_password",
   database="monument_db"
   ```

6. Run the Flask app:
   ```bash
   python app.py
   ```

---

## Usage

### Running the Application

1. **Start Backend** (if using Python backend):
   ```bash
   cd monument_project
   python app.py
   ```

2. **Start Frontend** (from root directory):
   ```bash
   npm run dev
   ```

3. **Access the Application**:
   - Open browser to `http://localhost:5173` (or port shown in terminal)
   - Register/Login to your account
   - Upload monument images for identification
   - View results and monument details

### Training the Model

To retrain the model with new data:
```bash
cd monument_project
python train_model.py
```

This will:
- Load training data from `dataset/Indian-monuments/images/train/`
- Train the CNN model
- Save the trained model to `model/`

### Making Predictions

```bash
cd monument_project
python predict.py --image_path path/to/monument.jpg
```

---

## Project Structure

```
monument-identification-system/
├── src/                          # React frontend
│   ├── App.tsx                  # Main React app
│   ├── main.tsx                 # Entry point
│   ├── types.ts                 # TypeScript definitions
│   ├── index.css                # Styles
│   └── data/
│       └── monumentsData.ts     # Monument metadata
│
├── monument_project/             # Python backend
│   ├── app.py                   # Flask application
│   ├── predict.py               # Model prediction
│   ├── train_model.py           # Model training
│   ├── database.sql             # Database schema
│   ├── requirements.txt          # Python dependencies
│   ├── dataset/                 # Training/test data
│   │   └── Indian-monuments/
│   │       └── images/
│   │           ├── train/       # Training images
│   │           └── test/        # Test images
│   └── model/                   # Trained model files
│
├── tools/                        # Development tools
│   ├── test_predict.js          # Frontend tests
│   └── test_predict_min.js
│
├── index.html                   # HTML entry point
├── package.json                 # Node.js dependencies
├── tsconfig.json               # TypeScript config
├── vite.config.ts              # Vite configuration
├── server.ts                   # Express server
└── README.md                   # This file
```

---

## Dataset

The project includes a comprehensive dataset of Indian monuments:

**Monuments Included:**
- Ajanta Caves
- Alai Darwaza
- Basilica of Bom Jesus
- Charminar
- Ellora Caves
- Fatehpur Sikri
- Gateway of India
- Golden Temple
- Hawa Mahal
- Humayun's Tomb
- India Gate
- Iron Pillar
- Jamali Kamali Tomb
- Khajuraho
- Lotus Temple
- Mysore Palace
- Qutub Minar
- Sun Temple Konark
- Taj Mahal
- Tanjavur Temple
- Victoria Memorial

**Dataset Split:**
- Training images: ~2,000+
- Testing images: ~800+

---

## Model Architecture

The system uses a **Convolutional Neural Network (CNN)** with:
- Multiple convolutional layers with ReLU activation
- Max pooling for dimensionality reduction
- Dense layers for classification
- Dropout for regularization
- Softmax output layer for multi-class classification

**Performance:**
- Training Accuracy: ~95%+
- Testing Accuracy: ~90%+

---

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - Login user
- `POST /api/logout` - Logout user

### Prediction
- `POST /api/predict` - Upload image and get prediction
- `GET /api/results` - Get user's prediction history
- `GET /api/monument/<id>` - Get monument details

---

## Build & Deployment

### Frontend Build
```bash
npm run build
```

Output: `dist/` directory

### Production Deployment

**Using Node.js Express server:**
```bash
npm run build
npm start
```

Server runs on port specified in environment or default 3000.

---

## Environment Variables

Create `.env.local` in root:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_API_URL=http://localhost:5000
```

Create `.env` in `monument_project/`:
```env
DATABASE_HOST=localhost
DATABASE_USER=root
DATABASE_PASSWORD=your_password
DATABASE_NAME=monument_db
FLASK_PORT=5000
```

---

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Windows: 
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### Database Connection Failed
- Ensure MySQL is running
- Verify credentials in `app.py`
- Check database exists: `mysql -u root -p -e "SHOW DATABASES;"`

### Model File Not Found
- Ensure `model/` directory exists
- Run `train_model.py` to generate trained model
- Check file permissions

### CORS Issues
- Add frontend URL to Flask CORS configuration
- Check backend is running on correct port

---

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see LICENSE file for details.

---

## Authors

- **Rakhshitha** - Project Lead
- Monument Identification System Team

---

## Acknowledgments

- Indian monument imagery dataset contributors
- TensorFlow/Keras documentation and community
- React and modern web development tools
- All contributors and testers

---

## Contact & Support

For questions, issues, or suggestions:
- 📧 Email: [Your Email]
- 🐛 Issues: [GitHub Issues](https://github.com/jenifferrakshitha/Monument_Identifier/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/jenifferrakshitha/Monument_Identifier/discussions)

---

**Star ⭐ this repository if you find it helpful!**
