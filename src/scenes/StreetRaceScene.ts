import { DialogueBox } from "../utils/DialogueBox";
import { Inventory } from "../utils/Inventory";
import { RaceVirtualPad } from "../utils/RaceVirtualPad";

type RaceState = "intro" | "instructions" | "countdown" | "racing" | "finish";

interface Obstacle {
  x: number;
  y: number;
  frame: number;
}

export class StreetRaceScene extends Phaser.Scene {
  private playerSprite!: Phaser.GameObjects.Sprite;
  private villanoSprite!: Phaser.GameObjects.Sprite;
  private dialogue!: DialogueBox;
  private racePad!: RaceVirtualPad;
  private gameState: RaceState = "intro";
  private finishLine = 7200;
  private raceDistanceText!: Phaser.GameObjects.Text;
  private countdownText!: Phaser.GameObjects.Text;
  private livesIcons: Phaser.GameObjects.Image[] = [];
  private lives = 3;
  private finishRaceStarted = false;

  private readonly lanes = [220, 300, 380];
  private targetLaneIndex = 1;
  private prevUp = false;
  private prevDown = false;
  private invulnerableUntil = 0;

  private obstacles: Obstacle[] = [];
  private obstacleSprites: Phaser.GameObjects.Sprite[] = [];

  constructor() {
    super({ key: "StreetRaceScene" });
  }

  create(): void {
    this.buildStreet();
    this.createPlayer();
    this.createVillano();
    this.createControls();
    this.dialogue = new DialogueBox(this);
    this.racePad = new RaceVirtualPad(this);

    this.raceDistanceText = this.add
      .text(20, 20, "Distancia: 700m", {
        fontSize: "20px",
        color: "#ffffff",
        fontFamily: '"Courier New", monospace',
        backgroundColor: "#00000088",
      })
      .setScrollFactor(0)
      .setDepth(50);

    this.livesIcons = [];
    this.updateLivesText();

    this.startIntro();
  }

  private buildStreet(): void {
    this.add
      .image(4000, 300, "bg-calle")
      .setDisplaySize(8000, 600)
      .setDepth(-10);

    this.createFinishLine();

    this.obstacles = [
      { x: 1000, y: 220, frame: 0 },
      { x: 1500, y: 380, frame: 1 },
      { x: 2000, y: 220, frame: 2 },
      { x: 2500, y: 380, frame: 3 },
      { x: 3000, y: 220, frame: 4 },
      { x: 3500, y: 380, frame: 0 },
      { x: 4000, y: 220, frame: 1 },
      { x: 4500, y: 380, frame: 2 },
      { x: 5000, y: 220, frame: 3 },
      { x: 5500, y: 380, frame: 4 },
      { x: 6000, y: 220, frame: 0 },
      { x: 6500, y: 380, frame: 1 },
      { x: 7000, y: 220, frame: 2 },
    ];

    this.obstacles.forEach((def) => {
      const spr = this.add
        .sprite(def.x, def.y, "obstaculos-calle", def.frame)
        .setDepth(2)
        .setScale(1.5);
      this.obstacleSprites.push(spr);
    });

    this.cameras.main.setBounds(0, 0, 8000, 600);
  }

  private createFinishLine(): void {
    // No se muestra ningún elemento visual en la meta.
  }

  private createPlayer(): void {
    this.playerSprite = this.add
      .sprite(80, 300, "laura", 0)
      .setScale(0.5)
      .setDepth(10);
  }

  private createVillano(): void {
    this.villanoSprite = this.add
      .sprite(80, 240, "villano", 0)
      .setScale(0.5)
      .setDepth(10);
  }

  private createControls(): void {
    // Solo controles táctiles/click en la carrera
  }

  private startIntro(): void {
    this.dialogue.show(
      [
        "Laura: ¡Ahí está! ¡El villano con Kiari!",
        "Villano: Ja, ¿me vas a alcanzar? ¡Corre!",
        "Laura: ¡No voy a dejar que se la lleven!",
      ],
      () => {
        this.showInstructions();
      },
    );
  }

  private showInstructions(): void {
    this.gameState = "instructions";

    const key = "panel-bg";
    if (!this.textures.exists(key)) {
      const g = this.add.graphics();
      g.fillStyle(0x000000, 0.92);
      g.fillRect(0, 0, 620, 420);
      g.lineStyle(4, 0xff69b4, 1);
      g.strokeRect(0, 0, 620, 420);
      g.generateTexture(key, 620, 420);
      g.destroy();
    }

    const bg = this.add.image(400, 300, key).setDepth(300).setScrollFactor(0);

    const title = this.add
      .text(400, 150, "CARRERA CALLEJERA", {
        fontSize: "34px",
        color: "#ff69b4",
        fontFamily: '"Courier New", monospace',
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(301)
      .setScrollFactor(0);

    const instructions = this.add
      .text(
        400,
        270,
        [
          "🏃 Laura corre sola automáticamente",
          "",
          "⬆️ ⬇️ Toca los botones para cambiar de carril",
          "",
          "Laura empieza en el carril CENTRO.",
          "Los obstáculos están arriba y abajo.",
          "",
          "❤️ Tienes 3 vidas.",
          "",
          "🎯 Llega a la meta.",
        ].join("\n"),
        {
          fontSize: "18px",
          color: "#ffffff",
          fontFamily: '"Courier New", monospace',
          align: "center",
          lineSpacing: 6,
        },
      )
      .setOrigin(0.5)
      .setDepth(301)
      .setScrollFactor(0);

    const startBtn = this.add
      .text(400, 450, "EMPEZAR", {
        fontSize: "30px",
        color: "#000000",
        fontFamily: '"Courier New", monospace',
        fontStyle: "bold",
        backgroundColor: "#32cd32",
      })
      .setOrigin(0.5)
      .setDepth(302)
      .setScrollFactor(0)
      .setInteractive({ cursor: "pointer" });

    startBtn.on("pointerdown", () => {
      bg.destroy();
      title.destroy();
      instructions.destroy();
      startBtn.destroy();
      this.startCountdown();
    });
  }

  private startCountdown(): void {
    this.gameState = "countdown";

    this.countdownText = this.add
      .text(400, 300, "3", {
        fontSize: "130px",
        color: "#ff69b4",
        fontFamily: '"Courier New", monospace',
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 10,
      })
      .setOrigin(0.5)
      .setDepth(400)
      .setScrollFactor(0);

    let count = 3;
    const timer = this.time.addEvent({
      delay: 1000,
      callback: () => {
        count--;
        if (count > 0) {
          this.countdownText.setText(String(count));
        } else if (count === 0) {
          this.countdownText.setText("¡YA!");
          this.countdownText.setColor("#32cd32");
        } else {
          this.countdownText.destroy();
          timer.remove();
          this.gameState = "racing";
          this.cameras.main.startFollow(this.playerSprite, true, 0.1, 0.1);
        }
      },
      callbackScope: this,
      loop: true,
    });
  }

  private updateLivesText(): void {
    this.livesIcons.forEach((icon) => icon.destroy());
    this.livesIcons = [];

    for (let i = 0; i < 3; i++) {
      const texture = i < this.lives ? "corazon" : "corazon-roto";
      const heart = this.add
        .image(28 + i * 38, 70, texture)
        .setDisplaySize(32, 32)
        .setScrollFactor(0)
        .setDepth(50);
      this.livesIcons.push(heart);
    }
  }

  private hitObstacle(): void {
    if (this.lives <= 0) return;

    this.lives--;
    this.updateLivesText();

    if (this.lives <= 0) {
      this.gameState = "finish";
      this.dialogue.show(
        [
          "Laura: ¡Ay! Me quedé sin vidas...",
          "Laura: No importa, ¡lo intentaré de nuevo!",
        ],
        () => {
          this.restartRace();
        },
      );
      return;
    }

    this.targetLaneIndex = 1;
    this.playerSprite.y = this.lanes[this.targetLaneIndex];
    this.invulnerableUntil = this.time.now + 2000;

    this.tweens.add({
      targets: this.playerSprite,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 10,
      onComplete: () => {
        this.playerSprite.alpha = 1;
      },
    });
  }

  update(_time: number, delta: number): void {
    if (this.gameState !== "racing" || this.finishRaceStarted) return;

    const now = this.time.now;
    const dt = delta / 1000;

    const isInvulnerable = now < this.invulnerableUntil;

    this.playerSprite.x += 280 * dt;

    const px = this.playerSprite.x;
    const py = this.playerSprite.y;

    for (const obs of this.obstacles) {
      const dx = Math.abs(px - obs.x);
      if (dx > 50) continue;

      const dy = Math.abs(py - obs.y);
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 45) {
        if (!isInvulnerable) {
          this.hitObstacle();
        }
        break;
      }
    }

    this.villanoSprite.x += 330 * dt;

    if (Math.floor(now / 100) % 2 === 0) {
      this.playerSprite.setFrame(1);
      this.villanoSprite.setFrame(1);
    } else {
      this.playerSprite.setFrame(0);
      this.villanoSprite.setFrame(0);
    }

    const up = this.racePad.up;
    const down = this.racePad.down;

    if (up && !this.prevUp) {
      this.targetLaneIndex = Math.max(0, this.targetLaneIndex - 1);
    }
    if (down && !this.prevDown) {
      this.targetLaneIndex = Math.min(
        this.lanes.length - 1,
        this.targetLaneIndex + 1,
      );
    }

    this.prevUp = up;
    this.prevDown = down;

    const targetY = this.lanes[this.targetLaneIndex];
    const dy = targetY - this.playerSprite.y;
    if (Math.abs(dy) > 2) {
      this.playerSprite.y += Math.sign(dy) * 450 * dt;
    } else {
      this.playerSprite.y = targetY;
    }

    this.cameras.main.scrollX = this.playerSprite.x - 400;

    const dist = Math.max(
      0,
      Math.round((this.finishLine - this.playerSprite.x) / 10),
    );
    this.raceDistanceText.setText(`Distancia: ${dist}m`);

    if (this.playerSprite.x >= this.finishLine) {
      this.finishRaceStarted = true;
      const playerWon = this.playerSprite.x >= this.villanoSprite.x;
      this.finishRace(playerWon);
      return;
    }

    if (isInvulnerable) {
      this.playerSprite.alpha = 0.5;
    }
  }

  private finishRace(playerWon: boolean): void {
    this.gameState = "finish";

    Inventory.add({
      id: "street-clue",
      title: "Pista de la calle",
      text: "El parque esconde lo siguiente.",
    });

    const messages = playerWon
      ? [
          "Laura: ¡Te alcancé! Devuélveme a Kiari.",
          "Villano: Mmm... no está aquí. Solo era una distracción.",
          "Villano: Toma, una pista. Ja ja ja.",
          'Pista obtenida: "El parque esconde lo siguiente."',
        ]
      : [
          "Villano: ¡Ja! Ni siquiera me alcanzaste.",
          "Villano: Pero te dejaré una pista por pena.",
          'Pista obtenida: "El parque esconde lo siguiente."',
        ];

    this.dialogue.show(messages, () => {
      this.scene.start("MemoryScene");
    });
  }

  private restartRace(): void {
    this.lives = 3;
    this.finishRaceStarted = false;
    this.targetLaneIndex = 1;
    this.prevUp = false;
    this.prevDown = false;
    this.invulnerableUntil = 0;
    this.updateLivesText();

    this.playerSprite.x = 80;
    this.playerSprite.y = 300;
    this.playerSprite.alpha = 1;

    this.villanoSprite.x = 80;
    this.villanoSprite.y = 240;

    this.gameState = "countdown";
    this.startCountdown();
  }
}
