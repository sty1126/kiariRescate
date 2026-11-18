export class PixelButton {
  private scene: Phaser.Scene;
  private bg!: Phaser.GameObjects.Image;
  private labelObj!: Phaser.GameObjects.Text;
  private normalTexture: string;
  private pressedTexture: string;
  private width: number;
  private height: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    baseColor: number,
    shadowColor: number,
    borderColor: number,
    highlightColor: number,
    pressedColor: number,
    onClick: () => void
  ) {
    this.scene = scene;
    this.width = width;
    this.height = height;
    this.normalTexture = `btn-${label}-${baseColor}-normal`;
    this.pressedTexture = `btn-${label}-${baseColor}-pressed`;

    this.createTexture(this.normalTexture, baseColor, shadowColor, borderColor, highlightColor);
    this.createTexture(this.pressedTexture, pressedColor, shadowColor, borderColor, 0x000000);

    this.bg = scene.add.image(x, y, this.normalTexture)
      .setInteractive({ cursor: 'pointer' })
      .setDepth(1)
      .setScrollFactor(0);
    this.labelObj = scene.add.text(x, y, label, {
      fontSize: `${Math.floor(height * 0.45)}px`,
      color: '#000000',
      fontFamily: '"Courier New", monospace',
      fontStyle: 'bold',
      stroke: '#ffffff',
      strokeThickness: 2
    }).setOrigin(0.5).setDepth(2).setScrollFactor(0);

    this.setupEvents(x, y, onClick);
  }

  private createTexture(key: string, base: number, shadow: number, border: number, highlight: number): void {
    if (this.scene.textures.exists(key)) return;

    const g = this.scene.add.graphics();
    const w = this.width;
    const h = this.height;

    // Sombra inferior/derecha
    g.fillStyle(shadow, 1);
    g.fillRect(6, 6, w, h);

    // Borde grueso
    g.fillStyle(border, 1);
    g.fillRect(0, 0, w, h);

    // Relleno principal
    g.fillStyle(base, 1);
    g.fillRect(4, 4, w - 8, h - 8);

    // Brillo superior/izquierdo
    g.fillStyle(highlight, 1);
    g.fillRect(4, 4, w - 8, 5);
    g.fillRect(4, 4, 5, h - 8);

    g.generateTexture(key, w, h);
    g.destroy();
  }

  private setupEvents(x: number, y: number, onClick: () => void): void {
    this.bg.on('pointerover', () => {
      this.bg.setScale(1.05);
      this.labelObj.setScale(1.05);
    });

    this.bg.on('pointerout', () => {
      this.bg.setTexture(this.normalTexture);
      this.bg.setPosition(x, y);
      this.bg.setScale(1);
      this.labelObj.setPosition(x, y);
      this.labelObj.setScale(1);
    });

    this.bg.on('pointerdown', () => {
      this.bg.setTexture(this.pressedTexture);
      this.bg.setPosition(x + 4, y + 4);
      this.labelObj.setPosition(x + 4, y + 4);
    });

    this.bg.on('pointerup', () => {
      this.bg.setTexture(this.normalTexture);
      this.bg.setPosition(x, y);
      this.labelObj.setPosition(x, y);
      onClick();
    });
  }
}
