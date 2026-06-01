import fs from 'fs';
import path from 'path';

(async () => {
  try {
    const dir = path.join(process.cwd(), 'monument_project', 'dataset', 'Indian-monuments', 'images', 'train', 'India gate pics');
    if (!fs.existsSync(dir)) {
      console.log('NO_DIR');
      process.exit(0);
    }
    const files = fs.readdirSync(dir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
    if (!files.length) {
      console.log('NO_IMAGE');
      process.exit(0);
    }
    const fileName = files[0];
    const imgPath = path.join(dir, fileName);
    const b = fs.readFileSync(imgPath).toString('base64');
    const body = { imageBytes: `data:image/jpeg;base64,${b}`, mimeType: 'image/jpeg', filename: fileName };

    const res = await fetch('http://localhost:3000/api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('ERROR', err);
    process.exit(1);
  }
})();
