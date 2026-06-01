import argparse
import json
import os
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import EfficientNetB0
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
import matplotlib.pyplot as plt

# Default dataset paths
DATASET_DIR = os.environ.get('DATASET_DIR', './dataset')
MODEL_SAVE_PATH = os.environ.get('MODEL_SAVE_PATH', './model/monument_efficientnet.h5')
MODEL_LABEL_PATH = os.environ.get('MODEL_LABEL_PATH', './model/class_labels.json')

# Image specs
IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 15


def get_class_labels_from_directory(directory):
    if not os.path.isdir(directory):
        raise FileNotFoundError(f"Dataset directory not found: {directory}")
    class_names = [name for name in os.listdir(directory) if os.path.isdir(os.path.join(directory, name))]
    class_names = sorted(class_names)
    if not class_names:
        raise ValueError(f"No class subdirectories found in {directory}")
    return class_names


def resolve_dataset_paths(dataset_dir):
    dataset_dir = os.path.abspath(dataset_dir)

    def find_images_root(root_dir):
        image_root = os.path.join(root_dir, 'images')
        if os.path.isdir(image_root):
            return image_root
        for child in os.listdir(root_dir):
            child_path = os.path.join(root_dir, child)
            nested_images = os.path.join(child_path, 'images')
            if os.path.isdir(nested_images):
                return nested_images
        return None

    image_root = find_images_root(dataset_dir)
    if image_root:
        dataset_dir = image_root

    train_dir = os.path.join(dataset_dir, 'train')
    test_dir = os.path.join(dataset_dir, 'test')
    if os.path.isdir(train_dir) and os.path.isdir(test_dir):
        return train_dir, test_dir
    return dataset_dir, None

# Step 1: Preprocessing and Data Augmentation
train_dir, test_dir = resolve_dataset_paths(DATASET_DIR)

if test_dir:
    class_labels = get_class_labels_from_directory(train_dir)
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=20,
        width_shift_range=0.2,
        height_shift_range=0.2,
        shear_range=0.2,
        zoom_range=0.2,
        horizontal_flip=True,
        fill_mode='nearest'
    )

    test_datagen = ImageDataGenerator(rescale=1./255)

    train_generator = train_datagen.flow_from_directory(
        train_dir,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        classes=class_labels
    )

    val_generator = test_datagen.flow_from_directory(
        test_dir,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        classes=class_labels
    )
else:
    class_labels = get_class_labels_from_directory(DATASET_DIR)
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=20,
        width_shift_range=0.2,
        height_shift_range=0.2,
        shear_range=0.2,
        zoom_range=0.2,
        horizontal_flip=True,
        fill_mode='nearest',
        validation_split=0.2  # 80-20 train-test split
    )

    train_generator = train_datagen.flow_from_directory(
        DATASET_DIR,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='training',
        classes=class_labels
    )

    val_generator = train_datagen.flow_from_directory(
        DATASET_DIR,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='validation',
        classes=class_labels
    )

# Step 2: Build Model using Transfer Learning (EfficientNetB0)
print("Loading EfficientNetB0 base model...")
base_model = EfficientNetB0(weights='imagenet', include_top=False, input_shape=(224, 224, 3))

# Freeze base model layers for feature extraction
base_model.trainable = False

x = base_model.output
x = GlobalAveragePooling2D()(x)
x = Dense(512, activation='relu')(x)
x = Dropout(0.5)(x)
predictions = Dense(train_generator.num_classes, activation='softmax')(x)

model = Model(inputs=base_model.input, outputs=predictions)

model.compile(
    optimizer=Adam(learning_rate=0.001),
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

# Step 3: Model Training
print("Starting training script...")
history = model.fit(
    train_generator,
    epochs=EPOCHS,
    validation_data=val_generator,
    verbose=1
)

# Step 4: Save trained weights
os.makedirs(os.path.dirname(MODEL_SAVE_PATH), exist_ok=True)
model.save(MODEL_SAVE_PATH)
print(f"Model successfully saved to {MODEL_SAVE_PATH}")

# Save class labels for prediction alignment
os.makedirs(os.path.dirname(MODEL_LABEL_PATH), exist_ok=True)
with open(MODEL_LABEL_PATH, 'w', encoding='utf-8') as label_file:
    json.dump(class_labels, label_file, ensure_ascii=False, indent=2)
print(f"Class labels successfully saved to {MODEL_LABEL_PATH}")

# Step 5: Save training curves
os.makedirs('./static', exist_ok=True)
plt.figure(figsize=(12, 4))
plt.subplot(1, 2, 1)
plt.plot(history.history['accuracy'], label='Train Accuracy')
plt.plot(history.history['val_accuracy'], label='Val Accuracy')
plt.title('Accuracy Curves')
plt.legend()

plt.subplot(1, 2, 2)
plt.plot(history.history['loss'], label='Train Loss')
plt.plot(history.history['val_loss'], label='Val Loss')
plt.title('Loss Curves')
plt.legend()
plt.savefig('./static/training_report.png')
print("Saved training metric chart to static/training_report.png")
