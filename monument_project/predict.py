import cv2
import json
import os
import numpy as np
import tensorflow as tf

def load_class_labels(label_path='./model/class_labels.json'):
    if not os.path.exists(label_path):
        raise FileNotFoundError(f"Class labels file not found: {label_path}")
    with open(label_path, 'r', encoding='utf-8') as f:
        return json.load(f)


def preprocess_image(image_path):
    # Load image using OpenCV
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError("Image could not be loaded")
    
    # 1. Resize to target dimension (224x224)
    img_resized = cv2.resize(img, (224, 224))
    
    # 2. Convert BGR to RGB (OpenCV extracts in BGR by default)
    img_rgb = cv2.cvtColor(img_resized, cv2.COLOR_BGR2RGB)
    
    # 3. Noise reduction using bilateral filter / gaussian blur
    img_denoised = cv2.fastNlMeansDenoisingColored(img_rgb, None, 10, 10, 7, 21)
    
    # 4. Normalize pixel values to [0, 1]
    img_normalized = img_denoised.astype(np.float32) / 255.0
    
    # Expand dims to batch shape (1, 224, 224, 3)
    img_batch = np.expand_dims(img_normalized, axis=0)
    return img_batch

def predict_monument(image_path, model_path, class_labels=None, label_path='./model/class_labels.json'):
    if class_labels is None:
        class_labels = load_class_labels(label_path)
    if not class_labels:
        raise ValueError("Class labels must be provided for prediction.")

    # Process original image
    processed_img = preprocess_image(image_path)
    
    # Load trained model
    model = tf.keras.models.load_model(model_path)
    
    # Predict probabilities
    predictions = model.predict(processed_img)
    class_idx = np.argmax(predictions[0])
    confidence = float(predictions[0][class_idx])
    
    predicted_label = class_labels[class_idx]
    return predicted_label, confidence
