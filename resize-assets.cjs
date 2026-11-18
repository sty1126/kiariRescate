const { Jimp } = require('jimp');
const path = require('path');

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
      await image.resize({ w: target.width, h: target.height, mode: Jimp.RESIZE_NEAREST_NEIGHBOR });
      await image.write(inputPath);
      console.log(`Resized ${target.file} to ${target.width}x${target.height}`);
    } catch (err) {
      console.error(`Error resizing ${target.file}:`, err.message);
    }
  }
}

resize();
