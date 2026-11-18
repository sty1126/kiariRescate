import { Player } from '../entities/Player';
import { DialogueBox } from '../utils/DialogueBox';
import { VirtualPad } from '../utils/VirtualPad';

type PillowState = 'intro' | 'fighting' | 'finish';

export class PillowFightScene extends Phaser.Scene {
  private player!: Player;
  private dialogue!: DialogueBox;
  private virtualPad!: VirtualPad;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private state: PillowState = 'intro';

  private loveBar!: Phaser.GameObjects.Rectangle;
  private loveValue = 0;
  private targetValue = 100;
  private companion!: Phaser.Physics.Arcade.Sprite;
  private heartParticles: Phaser.GameObjects.Image[] = [];
  private prevAction = false;

  constructor() {
    super({ key: 'PillowFightScene' });
  }

  create(): void {
    this.createTextures();
    this.buildRoom();
    this.createPlayer();
    this.createCompanion();
    this.createControls();
    this.dialogue = new DialogueBox(this);
    this.virtualPad = new VirtualPad(this);

    this.startIntro();
  }

  private createTextures(): void {
    if (!this.textures.exists('pillow')) {
      const g = this.add.graphics();
      g.fillStyle(0xffffff, 1);
      g.fillRect(0, 0, 50, 30);
      g.fillStyle(0xffb6c1, 1);
      g.fillRect(5, 5, 40, 20);
      g.generateTexture('pillow', 50, 30);
      g.destroy();
    }

    if (!this.textures.exists('heart')) {
      const g = this.add.graphics();
      g.fillStyle(0xff1493, 1);
      // Corazón pixelado
      const px = [
        '01100110',
        '11111111',
        '11111111',
        '11111111',
        '01111110',
        '00111100',
        '00011000',
        '00000000'
      ];
      px.forEach((row, y) => {
        for (let x = 0; x < row.length; x++) {
          if (row[x] === '1') {
            g.fillRect(x * 5, y * 5, 5, 5);
          }
        }
      });
      g.generateTexture('heart', 40, 40);
      g.destroy();
    }
  }

  private buildRoom(): void {
    this.add.image(400, 300, 'bg-almohadas')
      .setDisplaySize(800, 600)
      .setScrollFactor(0)
      .setDepth(-10);

    this.add.text(400, 80, 'PELEA DE ALMOHADAS', {
      fontSize: '36px',
      color: '#ff69b4',
      fontFamily: '"Courier New", monospace',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5).setScrollFactor(0).setDepth(10);
  }

  private createPlayer(): void {
    this.player = new Player(this, 250, 400);
    this.player.setFrozen(true);
  }

  private createCompanion(): void {
    this.companion = this.physics.add.sprite(550, 400, 'sarah', 0).setScale(0.5);
    this.companion.setFlipX(true);
    this.companion.setImmovable(true);
    this.companion.setDepth(2);

    const body = this.companion.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);

    this.add.text(550, 330, 'Sarah 💕', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: '"Courier New", monospace',
      backgroundColor: '#ff69b4'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(3);

    // Almohada de Sarah
    this.add.image(500, 400, 'pillow').setDepth(1).setScrollFactor(0);
  }

  private createControls(): void {
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  private startIntro(): void {
    this.dialogue.show([
      'Laura: Una pelea de almohadas ahora...',
      'Sarah: Es por el camino. Además, te ves adorable enfadada.',
      'Laura: ¡Ay, tú! Bueno, va. Pero después vamos por Kiari.',
      'Sarah: Trato. Presiona ESPACIO o el botón A rápido.',
      'Laura: ¿Barra de amor? Eso es trampa.'
    ], () => {
      this.showInstructions();
    });
  }

  private showInstructions(): void {
    const key = 'pillow-panel';
    if (!this.textures.exists(key)) {
      const g = this.add.graphics();
      g.fillStyle(0x000000, 0.92);
      g.fillRect(0, 0, 620, 320);
      g.lineStyle(4, 0xff69b4, 1);
      g.strokeRect(0, 0, 620, 320);
      g.generateTexture(key, 620, 320);
      g.destroy();
    }

    const bg = this.add.image(400, 300, key).setDepth(200).setScrollFactor(0);

    const title = this.add.text(400, 160, 'PELEA DE ALMOHADAS', {
      fontSize: '34px',
      color: '#ff69b4',
      fontFamily: '"Courier New", monospace',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(201).setScrollFactor(0);

    const text = this.add.text(400, 250, [
      'Presiona ESPACIO o el botón A lo más rápido posible',
      '',
      'Llena la barra de amor antes de que se acabe el tiempo'
    ].join('\n'), {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: '"Courier New", monospace',
      align: 'center',
      lineSpacing: 8
    }).setOrigin(0.5).setDepth(201).setScrollFactor(0);

    const btn = this.add.text(400, 360, 'EMPEZAR', {
      fontSize: '28px',
      color: '#000000',
      fontFamily: '"Courier New", monospace',
      fontStyle: 'bold',
      backgroundColor: '#32cd32'
    }).setOrigin(0.5).setDepth(202).setScrollFactor(0).setInteractive({ cursor: 'pointer' });

    btn.on('pointerdown', () => {
      bg.destroy();
      title.destroy();
      text.destroy();
      btn.destroy();
      this.startFight();
    });
  }

  private startFight(): void {
    this.state = 'fighting';
    this.loveValue = 0;

    // Barra de amor
    this.add.rectangle(400, 200, 400, 30, 0x333333)
      .setDepth(100)
      .setScrollFactor(0);
    this.loveBar = this.add.rectangle(200, 200, 0, 24, 0xff69b4)
      .setOrigin(0, 0.5)
      .setDepth(101)
      .setScrollFactor(0);

    this.add.text(400, 560, '¡ESPACIO / A rápido!', {
      fontSize: '20px',
      color: '#ff69b4',
      fontFamily: '"Courier New", monospace',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(100).setScrollFactor(0);

    // Almohada de Laura
    this.add.image(300, 400, 'pillow').setDepth(1).setScrollFactor(0);
  }

  private hitPillow(): void {
    if (this.state !== 'fighting') return;

    this.loveValue = Math.min(this.loveValue + 8, this.targetValue);
    this.loveBar.width = (this.loveValue / this.targetValue) * 400;

    // Animar golpe de almohada
    this.tweens.add({
      targets: this.player.getSprite(),
      x: 280,
      duration: 80,
      yoyo: true
    });

    this.spawnHeart();

    if (this.loveValue >= this.targetValue) {
      this.finishFight();
    }
  }

  private spawnHeart(): void {
    const heart = this.add.image(
      Phaser.Math.Between(200, 600),
      350,
      'heart'
    ).setDepth(50).setScrollFactor(0).setScale(0.5);

    this.heartParticles.push(heart);

    this.tweens.add({
      targets: heart,
      y: heart.y - 100,
      alpha: 0,
      scale: 1.2,
      duration: 1000,
      onComplete: () => {
        heart.destroy();
        this.heartParticles = this.heartParticles.filter(h => h !== heart);
      }
    });
  }

  private finishFight(): void {
    this.state = 'finish';
    this.player.setFrozen(true);

    this.dialogue.show([
      'Sarah: ¡Me rendí! Tu amor es más fuerte que mi almohada.',
      'Laura: Ja ja ja, ¿viste? Nadie me gana.',
      'Sarah: Ahora sí, vamos al parque a enfrentar al villano.',
      'Laura: ¡Kiari, ya vamos por ti!'
    ], () => {
      this.scene.start('DanceBattleScene');
    });
  }

  update(): void {
    if (this.dialogue.isOpen() && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.dialogue.advance();
      return;
    }

    if (this.state === 'fighting') {
      const justSpace = Phaser.Input.Keyboard.JustDown(this.spaceKey);
      const justAction = this.virtualPad.action && !this.prevAction;

      if (justSpace || justAction) {
        this.hitPillow();
      }

      this.prevAction = this.virtualPad.action;
    }
  }
}
