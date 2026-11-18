export function createDirectionalTextures(
  scene: Phaser.Scene,
  keyPrefix: string,
  color: number,
  size: number,
  noseColor: number = 0xff1493
): void {
  const directions: Array<{ name: string; noseX: number; noseY: number; noseW: number; noseH: number }> = [
    { name: 'down', noseX: size / 2 - 3, noseY: size - 10, noseW: 6, noseH: 6 },
    { name: 'left', noseX: 6, noseY: size / 2 - 3, noseW: 6, noseH: 6 },
    { name: 'right', noseX: size - 12, noseY: size / 2 - 3, noseW: 6, noseH: 6 },
    { name: 'up', noseX: size / 2 - 3, noseY: 6, noseW: 6, noseH: 6 }
  ];

  directions.forEach(dir => {
    const key = `${keyPrefix}-${dir.name}`;
    if (scene.textures.exists(key)) return;

    const g = scene.add.graphics();
    g.fillStyle(color, 1);
    g.fillRect(4, 4, size - 8, size - 4);
    g.fillStyle(0x000000, 1);
    g.fillRect(8, 10, 4, 4);
    g.fillRect(size - 12, 10, 4, 4);
    g.fillStyle(noseColor, 1);
    g.fillRect(dir.noseX, dir.noseY, dir.noseW, dir.noseH);
    g.generateTexture(key, size, size);
    g.destroy();
  });
}
