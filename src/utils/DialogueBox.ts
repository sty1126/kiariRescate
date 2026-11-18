export class DialogueBox {
  private scene: Phaser.Scene;
  private container!: Phaser.GameObjects.Container;
  private textObj!: Phaser.GameObjects.Text;
  private messages: string[] = [];
  private currentIndex = 0;
  private onComplete?: () => void;
  private isVisible = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.createBox();
  }

  private createBox(): void {
    const key = 'dialogue-bg';
    if (!this.scene.textures.exists(key)) {
      const g = this.scene.add.graphics();
      g.fillStyle(0x000000, 0.92);
      g.fillRect(0, 0, 760, 150);
      g.lineStyle(4, 0xff69b4, 1);
      g.strokeRect(0, 0, 760, 150);
      g.generateTexture(key, 760, 150);
      g.destroy();
    }

    const btnKey = 'dialogue-btn';
    if (!this.scene.textures.exists(btnKey)) {
      const g = this.scene.add.graphics();
      const w = 130;
      const h = 40;

      g.fillStyle(0x880e4f, 1);
      g.fillRect(4, 4, w, h);
      g.fillStyle(0x5c0a33, 1);
      g.fillRect(0, 0, w, h);
      g.fillStyle(0xff69b4, 1);
      g.fillRect(3, 3, w - 6, h - 6);
      g.fillStyle(0xffb6c1, 1);
      g.fillRect(3, 3, w - 6, 4);
      g.fillRect(3, 3, 4, h - 6);

      g.generateTexture(btnKey, w, h);
      g.destroy();
    }

    const btnPressedKey = 'dialogue-btn-pressed';
    if (!this.scene.textures.exists(btnPressedKey)) {
      const g = this.scene.add.graphics();
      const w = 130;
      const h = 40;

      g.fillStyle(0x880e4f, 1);
      g.fillRect(4, 4, w, h);
      g.fillStyle(0x5c0a33, 1);
      g.fillRect(0, 0, w, h);
      g.fillStyle(0xff1493, 1);
      g.fillRect(3, 3, w - 6, h - 6);

      g.generateTexture(btnPressedKey, w, h);
      g.destroy();
    }

    const bg = this.scene.add.image(400, 500, 'dialogue-bg')
      .setDepth(200)
      .setScrollFactor(0);

    this.textObj = this.scene.add.text(40, 440, '', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: '"Courier New", monospace',
      wordWrap: { width: 700 }
    }).setDepth(201).setScrollFactor(0);

    const btnX = 720;
    const btnY = 565;
    const continueBtn = this.scene.add.image(btnX, btnY, 'dialogue-btn')
      .setInteractive({ cursor: 'pointer' })
      .setDepth(202)
      .setScrollFactor(0);

    const continueLabel = this.scene.add.text(btnX, btnY, 'Continuar', {
      fontSize: '16px',
      color: '#000000',
      fontFamily: '"Courier New", monospace',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(203).setScrollFactor(0);

    continueBtn.on('pointerdown', () => {
      continueBtn.setTexture('dialogue-btn-pressed');
      continueBtn.setPosition(btnX + 2, btnY + 2);
      continueLabel.setPosition(btnX + 2, btnY + 2);
    });

    continueBtn.on('pointerup', () => {
      continueBtn.setTexture('dialogue-btn');
      continueBtn.setPosition(btnX, btnY);
      continueLabel.setPosition(btnX, btnY);
      this.advance();
    });

    continueBtn.on('pointerout', () => {
      continueBtn.setTexture('dialogue-btn');
      continueBtn.setPosition(btnX, btnY);
      continueLabel.setPosition(btnX, btnY);
    });

    this.container = this.scene.add.container(0, 0, [bg, this.textObj, continueBtn, continueLabel])
      .setDepth(200)
      .setScrollFactor(0);
    this.container.setVisible(false);
  }

  show(messages: string[], onComplete?: () => void): void {
    this.messages = messages;
    this.currentIndex = 0;
    this.onComplete = onComplete;
    this.isVisible = true;
    this.container.setVisible(true);
    this.showCurrent();
  }

  advance(): boolean {
    if (!this.isVisible) return false;

    this.currentIndex++;
    if (this.currentIndex >= this.messages.length) {
      this.hide();
      if (this.onComplete) this.onComplete();
      return true;
    }

    this.showCurrent();
    return false;
  }

  private showCurrent(): void {
    this.textObj.setText(this.messages[this.currentIndex]);
  }

  private hide(): void {
    this.isVisible = false;
    this.container.setVisible(false);
    this.textObj.setText('');
  }

  isOpen(): boolean {
    return this.isVisible;
  }
}
