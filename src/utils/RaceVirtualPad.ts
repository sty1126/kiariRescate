export class RaceVirtualPad {
  private scene: Phaser.Scene;
  public up = false;
  public down = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.createPad();
  }

  private createPad(): void {
    this.createButtonTexture('race-up', 0xff69b4);
    this.createButtonTexture('race-down', 0xff69b4);

    this.createButton(120, 500, 'race-up', '▲', () => this.up = true, () => this.up = false);
    this.createButton(120, 560, 'race-down', '▼', () => this.down = true, () => this.down = false);
  }

  private createButtonTexture(key: string, color: number): void {
    if (this.scene.textures.exists(key)) return;

    const g = this.scene.add.graphics();

    // Sombra
    g.fillStyle(0x000000, 0.5);
    g.fillRect(8, 8, 80, 80);

    // Borde grueso pixel
    g.fillStyle(0x000000, 1);
    g.fillRect(0, 0, 80, 80);

    // Botón principal
    g.fillStyle(color, 1);
    g.fillRect(4, 4, 72, 72);

    // Brillo superior
    g.fillStyle(0xffffff, 0.4);
    g.fillRect(4, 4, 72, 8);
    g.fillRect(4, 4, 8, 72);

    // Sombra inferior
    g.fillStyle(0x000000, 0.2);
    g.fillRect(4, 68, 72, 8);
    g.fillRect(68, 4, 8, 72);

    g.generateTexture(key, 80, 80);
    g.destroy();
  }

  private createButton(
    x: number,
    y: number,
    key: string,
    label: string,
    onPress: () => void,
    onRelease: () => void
  ): void {
    const bg = this.scene.add.image(x, y, key)
      .setInteractive({ cursor: 'pointer' })
      .setDepth(100)
      .setScrollFactor(0);

    this.scene.add.text(x, y - 2, label, {
      fontSize: '42px',
      color: '#000000',
      fontFamily: '"Courier New", monospace',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(101).setScrollFactor(0);

    bg.on('pointerdown', () => {
      bg.setScale(0.92);
      onPress();
    });

    bg.on('pointerup', () => {
      bg.setScale(1);
      onRelease();
    });

    bg.on('pointerout', () => {
      bg.setScale(1);
      onRelease();
    });
  }
}
