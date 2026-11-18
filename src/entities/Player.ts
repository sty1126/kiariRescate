export type Direction = 'down' | 'up' | 'left' | 'right';

export interface PlayerAnimConfig {
  textureKey: string;
  frameWidth: number;
  frameHeight: number;
  rowDown: number;
  rowUp: number;
  rowLeft: number;
  rowRight: number;
  walkFrames: number[];
  idleFrame: number;
  scale?: number;
}

export const LAURA_ANIM: PlayerAnimConfig = {
  textureKey: 'laura',
  frameWidth: 200,
  frameHeight: 160,
  rowDown: 0,
  rowUp: 3,
  rowLeft: 1,
  rowRight: 2,
  walkFrames: [0, 1, 2, 1],
  idleFrame: 0,
  scale: 0.5
};

let playerInstanceCount = 0;

export class Player {
  static createAnimations(scene: Phaser.Scene, config: PlayerAnimConfig): void {
    const cols = 3;
    const directions: Direction[] = ['down', 'left', 'right', 'up'];

    directions.forEach(dir => {
      const row = (() => {
        switch (dir) {
          case 'down': return config.rowDown;
          case 'up': return config.rowUp;
          case 'left': return config.rowLeft;
          case 'right': return config.rowRight;
        }
      })();

      const frames = config.walkFrames.map(f => row * cols + f);
      scene.anims.create({
        key: `${config.textureKey}-walk-${dir}`,
        frames: scene.anims.generateFrameNumbers(config.textureKey, { frames }),
        frameRate: 8,
        repeat: -1
      });
    });
  }

  private sprite: Phaser.Physics.Arcade.Sprite;
  private animConfig: PlayerAnimConfig;
  private speed = 180;
  private facing: Direction = 'down';
  private frozen = false;
  private id: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    animConfig: PlayerAnimConfig = LAURA_ANIM
  ) {
    this.id = playerInstanceCount++;
    this.animConfig = animConfig;

    const textureKey = animConfig.textureKey;
    const initialFrame = this.getFrameIndex('down', animConfig.idleFrame);

    this.sprite = scene.physics.add.sprite(x, y, textureKey, initialFrame);

    const scale = animConfig.scale || 1;
    this.sprite.setScale(scale);

    const scaledWidth = animConfig.frameWidth * scale * 0.5;
    const scaledHeight = animConfig.frameHeight * scale * 0.5;
    this.sprite.setSize(scaledWidth, scaledHeight);
    this.sprite.setOffset(
      (animConfig.frameWidth * scale - scaledWidth) / 2,
      (animConfig.frameHeight * scale - scaledHeight) / 2 + animConfig.frameHeight * scale * 0.1
    );

    this.sprite.setCollideWorldBounds(true);

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setGravity(0, 0);
    body.setDrag(0);
    body.setFriction(0, 0);
    body.setDamping(false);

    console.log(`[Player ${this.id}] creada en (${x}, ${y}) con sprite ${textureKey}`);
  }

  private getFrameIndex(dir: Direction, frameInRow: number): number {
    let row = 0;
    switch (dir) {
      case 'down': row = this.animConfig.rowDown; break;
      case 'up': row = this.animConfig.rowUp; break;
      case 'left': row = this.animConfig.rowLeft; break;
      case 'right': row = this.animConfig.rowRight; break;
    }
    return row * 3 + frameInRow;
  }

  update(up: boolean, down: boolean, left: boolean, right: boolean): void {
    if (this.frozen) return;

    let dx = 0;
    let dy = 0;

    if (up) dy = -1;
    else if (down) dy = 1;
    else if (left) dx = -1;
    else if (right) dx = 1;

    if (dx !== 0 || dy !== 0) {
      const dir: Direction = dx > 0 ? 'right' : dx < 0 ? 'left' : dy > 0 ? 'down' : 'up';
      this.facing = dir;
      this.sprite.setVelocity(dx * this.speed, dy * this.speed);
      this.sprite.play(`${this.animConfig.textureKey}-walk-${dir}`, true);
    } else {
      this.sprite.setVelocity(0);
      this.sprite.stop();
      this.sprite.setFrame(this.getFrameIndex(this.facing, this.animConfig.idleFrame));
      this.snapToGrid();
    }
  }

  private snapToGrid(): void {
    const gridSize = 32;
    const scaledHeight = this.animConfig.frameHeight * (this.animConfig.scale || 1);
    const feetY = this.sprite.y + scaledHeight * 0.25;
    const snappedX = Math.round(this.sprite.x / gridSize) * gridSize;
    const snappedY = Math.round(feetY / gridSize) * gridSize - scaledHeight * 0.25;

    if (Math.abs(this.sprite.x - snappedX) > 0.5 || Math.abs(this.sprite.y - snappedY) > 0.5) {
      this.sprite.x = snappedX;
      this.sprite.y = snappedY;
    }
  }

  getSprite(): Phaser.Physics.Arcade.Sprite {
    return this.sprite;
  }

  getFacing(): Direction {
    return this.facing;
  }

  setFrozen(value: boolean): void {
    this.frozen = value;
    this.sprite.setVelocity(0);
    if (value) {
      this.sprite.stop();
    }
    console.log(`[Player ${this.id}] frozen = ${value}`);
  }

  isFrozen(): boolean {
    return this.frozen;
  }
}
