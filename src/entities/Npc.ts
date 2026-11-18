import { PlayerAnimConfig } from './Player';

export class Npc {
  private sprite: Phaser.Physics.Arcade.Sprite;
  private animConfig: PlayerAnimConfig;

  constructor(scene: Phaser.Scene, x: number, y: number, animConfig: PlayerAnimConfig) {
    this.animConfig = animConfig;

    const initialFrame = this.getFrameIndex('down', animConfig.idleFrame);
    this.sprite = scene.physics.add.sprite(x, y, animConfig.textureKey, initialFrame);

    const scale = animConfig.scale || 1;
    this.sprite.setScale(scale);

    const scaledWidth = animConfig.frameWidth * scale * 0.4;
    const scaledHeight = animConfig.frameHeight * scale * 0.4;
    this.sprite.setSize(scaledWidth, scaledHeight);
    this.sprite.setOffset(
      (animConfig.frameWidth * scale - scaledWidth) / 2,
      (animConfig.frameHeight * scale - scaledHeight) / 2 + animConfig.frameHeight * scale * 0.25
    );

    this.sprite.setImmovable(true);

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
  }

  private getFrameIndex(dir: 'down' | 'up' | 'left' | 'right', frameInRow: number): number {
    let row = 0;
    switch (dir) {
      case 'down': row = this.animConfig.rowDown; break;
      case 'up': row = this.animConfig.rowUp; break;
      case 'left': row = this.animConfig.rowLeft; break;
      case 'right': row = this.animConfig.rowRight; break;
    }
    return row * 3 + frameInRow;
  }

  moveTo(x: number, y: number, duration: number, onComplete?: () => void): void {
    const dx = x - this.sprite.x;
    const dy = y - this.sprite.y;
    const dir = Math.abs(dx) > Math.abs(dy)
      ? (dx > 0 ? 'right' : 'left')
      : (dy > 0 ? 'down' : 'up');

    this.sprite.play(`${this.animConfig.textureKey}-walk-${dir}`);

    this.sprite.scene.tweens.add({
      targets: this.sprite,
      x,
      y,
      duration,
      ease: 'Linear',
      onComplete: () => {
        this.sprite.stop();
        this.sprite.setFrame(this.getFrameIndex(dir, this.animConfig.idleFrame));
        if (onComplete) onComplete();
      }
    });
  }

  getSprite(): Phaser.Physics.Arcade.Sprite {
    return this.sprite;
  }

  destroy(): void {
    this.sprite.destroy();
  }
}
