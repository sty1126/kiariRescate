import { Player } from "../entities/Player";
import { DialogueBox } from "../utils/DialogueBox";
import { VirtualPad } from "../utils/VirtualPad";
import { Inventory } from "../utils/Inventory";

type DanceState = "intro" | "instructions" | "dancing" | "finish";

interface Arrow {
  sprite: Phaser.GameObjects.Image;
  direction: "up" | "down" | "left" | "right";
}

export class DanceBattleScene extends Phaser.Scene {
  private player!: Player;
  private dialogue!: DialogueBox;
  private virtualPad!: VirtualPad;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private state: DanceState = "intro";

  private targetZoneY = 500;
  private arrows: Arrow[] = [];
  private rhythmBar!: Phaser.GameObjects.Rectangle;
  private rhythmText!: Phaser.GameObjects.Text;
  private rhythmValue = 0;
  private rhythmTarget = 100;
  private spawnTimer!: Phaser.Time.TimerEvent;
  private villain!: Phaser.Physics.Arcade.Sprite;
  private kiari!: Phaser.Physics.Arcade.Sprite;
  private sarah!: Phaser.Physics.Arcade.Sprite;
  private prevPad = { up: false, down: false, left: false, right: false };

  constructor() {
    super({ key: "DanceBattleScene" });
  }

  create(): void {
    this.buildStage();
    this.createCharacters();
    this.createControls();
    this.dialogue = new DialogueBox(this);
    this.virtualPad = new VirtualPad(this);

    this.startIntro();
  }

  private buildStage(): void {
    // Fondo real del dancehall
    this.add
      .image(400, 300, "bd-dancehall")
      .setDisplaySize(800, 600)
      .setScrollFactor(0)
      .setDepth(-10);

    // Pista de baile
    this.add
      .ellipse(400, 520, 700, 180, 0x4b0082)
      .setScrollFactor(0)
      .setDepth(0)
      .setAlpha(0.6);
    this.add
      .ellipse(400, 520, 650, 150, 0x8a2be2)
      .setScrollFactor(0)
      .setDepth(0)
      .setAlpha(0.4);

    // Luces de discoteca en el techo
    const colors = [0xff00ff, 0x00ffff, 0xffff00, 0x00ff00, 0xff6600];
    for (let i = 0; i < 8; i++) {
      const light = this.add
        .circle(70 + i * 95, 50, 22, colors[i % colors.length])
        .setScrollFactor(0)
        .setDepth(0)
        .setAlpha(0.6);
      this.tweens.add({
        targets: light,
        alpha: 1,
        scale: 1.4,
        duration: 400,
        yoyo: true,
        repeat: -1,
        delay: i * 80,
      });
    }

    // Título épico
    this.add
      .text(400, 45, "✨ BATALLA DE BAILE FINAL ✨", {
        fontSize: "38px",
        color: "#ff69b4",
        fontFamily: '"Courier New", monospace',
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(10);

    // Zona de targets
    this.add
      .rectangle(400, this.targetZoneY, 720, 90, 0x000000)
      .setScrollFactor(0)
      .setDepth(1)
      .setAlpha(0.5);
    this.add
      .rectangle(400, this.targetZoneY, 720, 4, 0xff69b4)
      .setScrollFactor(0)
      .setDepth(1);

    const xPositions = { left: 250, down: 383, up: 516, right: 650 };
    const textures: Record<"up" | "down" | "left" | "right", string> = {
      left: "tecla-izquierda",
      down: "tecla-abajo",
      up: "tecla-arriba",
      right: "tecla-derecha",
    };

    (["left", "down", "up", "right"] as const).forEach((dir) => {
      this.add
        .image(xPositions[dir], this.targetZoneY, textures[dir])
        .setScrollFactor(0)
        .setDepth(2)
        .setAlpha(0.4)
        .setDisplaySize(78, 78);
    });

    // Barra de ritmo
    this.add
      .rectangle(400, 120, 400, 24, 0x333333)
      .setDepth(10)
      .setScrollFactor(0);
    this.rhythmBar = this.add
      .rectangle(200, 120, 0, 18, 0x00ffff)
      .setOrigin(0, 0.5)
      .setDepth(11)
      .setScrollFactor(0);
    this.rhythmText = this.add
      .text(400, 150, "¡Toca las flechas al ritmo!", {
        fontSize: "18px",
        color: "#ffffff",
        fontFamily: '"Courier New", monospace',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(10);
  }

  private createCharacters(): void {
    // Laura bailarina
    this.player = new Player(this, 200, 400);
    this.player.setFrozen(true);
    this.player.getSprite().setScale(0.75);

    // Amor animando
    this.sarah = this.physics.add.sprite(140, 410, "sarah", 0).setScale(0.65);
    this.sarah.setImmovable(true);
    this.sarah.setDepth(2);
    (this.sarah.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    this.add
      .text(140, 340, "Amor ❤️", {
        fontSize: "14px",
        color: "#ffffff",
        backgroundColor: "#ff69b4",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(3);

    // Villano
    this.villain = this.physics.add
      .sprite(620, 410, "villano", 0)
      .setScale(1.05);
    this.villain.setImmovable(true);
    this.villain.setDepth(2);
    (this.villain.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    this.add
      .text(600, 340, "Villano", {
        fontSize: "14px",
        color: "#ffffff",
        backgroundColor: "#000000",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(3);

    // Kiari cautiva
    this.kiari = this.physics.add.sprite(700, 450, "kiari", 0).setScale(0.45);
    this.kiari.setImmovable(true);
    this.kiari.setDepth(2);
    (this.kiari.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    this.add
      .text(700, 410, "Kiari 🐶", {
        fontSize: "14px",
        color: "#ffffff",
        backgroundColor: "#ff69b4",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(3);
  }

  private createControls(): void {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.spaceKey = this.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE,
    );
  }

  private startIntro(): void {
    this.dialogue.show(
      [
        "Villano: ¡Llegaste hasta aquí, Laura!",
        "Laura: Devuélveme a Kiari. Y devuélveme también mi pizza.",
        "Villano: Solo si me ganas en... ¡LA BATALLA DE BAILE!",
        "Villano: Prepárate para los movimientos más peludos de tu vida.",
        "Laura: Kiari, cierra los oídos. Esto va a ser épico.",
        "Amor: ¡Tú puedes, amor! Toca las flechas cuando lleguen a la zona.",
        "Amor: Además tú bailas súper bien, desde chiquita le metías a la salsa y al reguetón.",
        "Amor: Ese villano no sabe contra quién se mete.",
        "Laura: Ja ja ja, es verdad, mi amor. ¡Vamos a bailar!",
      ],
      () => {
        this.showInstructions();
      },
    );
  }

  private showInstructions(): void {
    this.state = "instructions";

    const key = "dance-panel";
    if (!this.textures.exists(key)) {
      const g = this.add.graphics();
      g.fillStyle(0x000000, 0.92);
      g.fillRect(0, 0, 620, 400);
      g.lineStyle(4, 0xff69b4, 1);
      g.strokeRect(0, 0, 620, 400);
      g.generateTexture(key, 620, 400);
      g.destroy();
    }

    const bg = this.add.image(400, 300, key).setDepth(300).setScrollFactor(0);

    const title = this.add
      .text(400, 160, "💃 BATALLA DE BAILE 🕺", {
        fontSize: "34px",
        color: "#ff69b4",
        fontFamily: '"Courier New", monospace',
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(301)
      .setScrollFactor(0);

    const text = this.add
      .text(
        400,
        270,
        [
          "Flechas caen desde arriba",
          "",
          "Toca las flechas cuando pasen",
          "por la zona de abajo",
          "",
          "Llena la barra de ritmo para ganar",
          "No hay penalización por fallar",
        ].join("\n"),
        {
          fontSize: "20px",
          color: "#ffffff",
          fontFamily: '"Courier New", monospace',
          align: "center",
          lineSpacing: 8,
        },
      )
      .setOrigin(0.5)
      .setDepth(301)
      .setScrollFactor(0);

    const btn = this.add
      .text(400, 420, "BAILAR", {
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

    btn.on("pointerdown", () => {
      bg.destroy();
      title.destroy();
      text.destroy();
      btn.destroy();
      this.startDance();
    });
  }

  private startDance(): void {
    this.state = "dancing";
    this.rhythmValue = 0;

    this.spawnTimer = this.time.addEvent({
      delay: 800,
      callback: () => this.spawnArrow(),
      callbackScope: this,
      loop: true,
    });

    this.add
      .text(400, 580, "Toca ↑ ↓ ← → para bailar", {
        fontSize: "18px",
        color: "#ffffff",
        fontFamily: '"Courier New", monospace',
        backgroundColor: "#00000080",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(20);
  }

  private spawnArrow(): void {
    const dirs: Array<"up" | "down" | "left" | "right"> = [
      "up",
      "down",
      "left",
      "right",
    ];
    const dir = dirs[Math.floor(Math.random() * dirs.length)];
    const xPositions = { left: 250, down: 383, up: 516, right: 650 };

    const dirTextures: Record<"up" | "down" | "left" | "right", string> = {
      left: "tecla-izquierda",
      down: "tecla-abajo",
      up: "tecla-arriba",
      right: "tecla-derecha",
    };

    const sprite = this.add
      .image(xPositions[dir], 80, dirTextures[dir])
      .setScrollFactor(0)
      .setDepth(5)
      .setDisplaySize(78, 78);

    this.arrows.push({ sprite, direction: dir });
  }

  private updateDance(delta: number): void {
    const dt = delta / 1000;
    const speed = 300;

    for (let i = this.arrows.length - 1; i >= 0; i--) {
      const arrow = this.arrows[i];
      arrow.sprite.y += speed * dt;
      arrow.sprite.angle = 0;

      if (arrow.sprite.y > 620) {
        arrow.sprite.destroy();
        this.arrows.splice(i, 1);
      }
    }

    // Animaciones de baile
    const frame = Math.floor(this.time.now / 200) % 2;
    this.player.getSprite().setFrame(frame);
    this.sarah.setFrame(frame);
    this.villain.setFrame(frame);
    this.kiari.setFrame(frame === 0 ? 1 : 0);

    if (this.rhythmValue >= this.rhythmTarget) {
      this.finishDance();
    }
  }

  private tryHit(direction: "up" | "down" | "left" | "right"): void {
    if (this.state !== "dancing") return;

    let hit = false;

    for (let i = this.arrows.length - 1; i >= 0; i--) {
      const arrow = this.arrows[i];
      if (arrow.direction === direction) {
        const dist = Math.abs(arrow.sprite.y - this.targetZoneY);
        if (dist < 70) {
          hit = true;
          arrow.sprite.destroy();
          this.arrows.splice(i, 1);
          break;
        }
      }
    }

    if (hit) {
      this.rhythmValue = Math.min(this.rhythmValue + 8, this.rhythmTarget);
      this.rhythmBar.width = (this.rhythmValue / this.rhythmTarget) * 400;
      this.rhythmText.setText("¡Bien! Sigue el ritmo 💃");
      this.cameras.main.flash(100, 0x00ffff, 0.3);

      // Efecto de baile
      this.tweens.add({
        targets: [this.player.getSprite(), this.sarah],
        angle: 15,
        duration: 150,
        yoyo: true,
      });
    } else {
      this.rhythmText.setText("¡Espera la flecha correcta!");
    }
  }

  private finishDance(): void {
    if (this.state === "finish") return;
    this.state = "finish";

    this.spawnTimer.remove();
    this.arrows.forEach((a) => a.sprite.destroy());
    this.arrows = [];

    this.player.setFrozen(true);
    this.villain.setTint(0x888888);

    Inventory.add({
      id: "final-clue",
      title: "Kiari rescatada",
      text: "Kiari está a salvo con Laura.",
    });

    this.dialogue.show(
      [
        "Villano: ¡No! ¿Cómo bailaste tan bien?",
        "Laura: Porque bailo con el corazón. Y con amor por Kiari.",
        "Villano: Está bien... se los devuelvo.",
        "Kiari: ¡Guau guau! (¡Laura!)",
        "Laura: ¡Kiari! ¡Mi bebé!",
        "Amor: Lo lograste, amor. Eres mi héroe.",
        "Laura: Nuestro héroe. Gracias por acompañarme, mi amor.",
        "FIN: Kiari Rescue - Un juego hecho con amor para Laura ❤️",
      ],
      () => {
        this.showEndScreen();
      },
    );
  }

  private showEndScreen(): void {
    this.add
      .image(400, 300, "final-frame")
      .setDisplaySize(800, 600)
      .setDepth(1000)
      .setScrollFactor(0);

    this.add
      .text(400, 500, "¡FELICIDADES!", {
        fontSize: "38px",
        color: "#ff69b4",
        fontFamily: '"Courier New", monospace',
        fontStyle: "bold",
        stroke: "#ffffff",
        strokeThickness: 4,
        backgroundColor: "#ffffffcc",
        padding: { x: 12, y: 5 },
      })
      .setOrigin(0.5)
      .setDepth(1001)
      .setScrollFactor(0);

    this.add
      .text(400, 545, "Rescataste a Kiari ❤️", {
        fontSize: "24px",
        color: "#ffffff",
        fontFamily: '"Courier New", monospace',
        stroke: "#880e4f",
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(1001)
      .setScrollFactor(0);

    this.add
      .text(400, 570, "Un juego creado con amor para Laura\npor Sarah", {
        fontSize: "15px",
        color: "#ffd700",
        fontFamily: '"Courier New", monospace',
        align: "center",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(1001)
      .setScrollFactor(0);
  }

  update(_time: number, delta: number): void {
    if (
      this.dialogue.isOpen() &&
      Phaser.Input.Keyboard.JustDown(this.spaceKey)
    ) {
      this.dialogue.advance();
      return;
    }

    if (this.state === "dancing") {
      this.updateDance(delta);

      if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) this.tryHit("up");
      if (Phaser.Input.Keyboard.JustDown(this.cursors.down))
        this.tryHit("down");
      if (Phaser.Input.Keyboard.JustDown(this.cursors.left))
        this.tryHit("left");
      if (Phaser.Input.Keyboard.JustDown(this.cursors.right))
        this.tryHit("right");

      if (this.virtualPad.up && !this.prevPad.up) this.tryHit("up");
      if (this.virtualPad.down && !this.prevPad.down) this.tryHit("down");
      if (this.virtualPad.left && !this.prevPad.left) this.tryHit("left");
      if (this.virtualPad.right && !this.prevPad.right) this.tryHit("right");

      this.prevPad = {
        up: this.virtualPad.up,
        down: this.virtualPad.down,
        left: this.virtualPad.left,
        right: this.virtualPad.right,
      };
    }
  }
}
