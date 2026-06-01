Kaggle Monument Dataset Folder

Supported structure:
- ./dataset/train/<class_name>/*.jpg
- ./dataset/train/<class_name>/*.png
- ./dataset/test/<class_name>/*.jpg
- ./dataset/test/<class_name>/*.png

Example:
- ./dataset/train/Taj Mahal/
- ./dataset/train/India Gate/
- ./dataset/test/Taj Mahal/
- ./dataset/test/India Gate/

The training script will automatically infer class labels from the directory names.
If your archive contains an extra images folder, place the root folder under ./dataset so the script can find ./dataset/images/train and ./dataset/images/test as well.
