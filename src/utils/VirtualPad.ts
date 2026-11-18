import { PixelButton } from './PixelButton';

export class VirtualPad {
  private scene: Phaser.Scene;
  public up = false;
  public down = false;
  public left = false;
  public right = false;
  public action = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.createPad();
  }

  private createPad(): void {
    const size = 60;
    const gap = 6;
    const centerX = 130;
    const centerY = 500;

    // D-pad direccional
    this.createDpadButton(centerX, centerY - size - gap, '▲', () => this.up = true, () => this.up = false);
    this.createDpadButton(centerX, centerY + size + gap, '▼', () => this.down = true, () => this.down = false);
    this.createDpadButton(centerX - size - gap, centerY, '◀', () => this.left = true, () => this.left = false);
    this.createDpadButton(centerX + size + gap, centerY, '▶', () => this.right = true, () => this.right = false);

    // Botón de acción A
    new PixelButton(
      this.scene,
      680, 500,
      70, 60,
      'A',
      0x32cd32,
      0x006400,
      0x004d00,
      0x90ee90,
      0x228b22,
      () => {
        this.action = true;
        this.scene.time.delayedCall(100, () => {
          this.action = false;
        });
      }
    );
  }

  private createDpadButton(
    x: number,
    y: number,
    label: string,
    onPress: () => void,
    onRelease: () => void
  ): void {
    const key = `dpad-${label}-${x}-${y}`;
    const pressedKey = `${key}-pressed`;

    if (!this.scene.textures.exists(key)) {
      this.createButtonTexture(key, 0x444444, 0x000000, 0x666666, 0x888888);
    }
    if (!this.scene.textures.exists(pressedKey)) {
      this.createButtonTexture(pressedKey, 0xff69b4, 0x880e4f, 0x5c0a33, 0xffb6c1);
    }

    const bg = this.scene.add.image(x, y, key)
      .setInteractive({ cursor: 'pointer' })
      .setDepth(100)
      .setScrollFactor(0);
    this.scene.add.text(x, y, label, {
      fontSize: '30px',
      color: '#ffffff',
      fontFamily: '"Courier New", monospace',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(101).setScrollFactor(0);

    bg.on('pointerdown', () => {
      bg.setTexture(pressedKey);
      onPress();
    });

    bg.on('pointerup', () => {
      bg.setTexture(key);
      onRelease();
    });

    bg.on('pointerout', () => {
      bg.setTexture(key);
      onRelease();
    });
  }

  private createButtonTexture(key: string, base: number, shadow: number, border: number, highlight: number): void {
    if (this.scene.textures.exists(key)) return;

    const g = this.scene.add.graphics();
    const size = 60;

    g.fillStyle(shadow, 1);
    g.fillRect(5, 5, size, size);

    g.fillStyle(border, 1);
    g.fillRect(0, 0, size, size);

    g.fillStyle(base, 1);
    g.fillRect(4, 4, size - 8, size - 8);

    g.fillStyle(highlight, 1);
    g.fillRect(4, 4, size - 8, 5);
    g.fillRect(4, 4, 5, size - 8);

    g.generateTexture(key, size, size);
    g.destroy();
  }
}
