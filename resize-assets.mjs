import Jimp from 'jimp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.join(__dirname, 'public', 'assets');

const targets = [
  { file: 'villano.png', width: 600, height: 640 },
  { file: 'sarah.png', width: 600, height: 640 },
  { file: 'obstaculos-calle.png', width: 320, height: 64 }
];

async function resize() {
  for (const target of targets) {
    const inputPath = path.join(assetsDir, target.file);
    try {
      const image = await Jimp.read(inputPath);
      await image.resize(target.width, target.height, Jimp.RESIZE_NEAREST_NEIGHBOR);
      await image.writeAsync(inputPath);
      console.log(`Resized ${target.file} to ${target.width}x${target.height}`);
    } catch (err) {
      console.error(`Error resizing ${target.file}:`, err.message);
    }
  }
}

resize();
