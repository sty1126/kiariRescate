import { Player } from "../entities/Player";
import { DialogueBox } from "../utils/DialogueBox";
import { Inventory } from "../utils/Inventory";
import { VirtualPad } from "../utils/VirtualPad";

type HoodState =
  | "intro"
  | "playing"
  | "pizza-intro"
  | "pizza-game"
  | "pizza-finish";

interface FallingItem {
  sprite: Phaser.GameObjects.Image;
  type: "good" | "bad";
  key: string;
}

export class NeighborhoodScene extends Phaser.Scene {
  private player!: Player;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { [key: string]: Phaser.Input.Keyboard.Key };
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private dialogue!: DialogueBox;
  private virtualPad!: VirtualPad;
  private state: HoodState = "intro";

  private obstacles!: Phaser.Physics.Arcade.StaticGroup;
  private companion!: Phaser.Physics.Arcade.Sprite;
  private companionLabel!: Phaser.GameObjects.Text;
  private companionBubble!: Phaser.GameObjects.Text;
  private pizzeriaDoor!: Phaser.GameObjects.Zone;

  // Pizza minigame
  private pizzaGroup!: Phaser.GameObjects.Container;
  private pizzaScore = 0;
  private pizzaLives = 3;
  private pizzaScoreText!: Phaser.GameObjects.Text;
  private pizzaTimerText!: Phaser.GameObjects.Text;
  private pizzaTray!: Phaser.GameObjects.Image;
  private fallingItems: FallingItem[] = [];
  private spawnTimer!: Phaser.Time.TimerEvent;
  private gameTimer!: Phaser.Time.TimerEvent;
  private pizzaTimeLeft = 60;
  private pizzaLivesIcons: Phaser.GameObjects.Image[] = [];

  constructor() {
    super({ key: "NeighborhoodScene" });
  }

  create(): void {
    this.createPixelTextures();
    this.buildNeighborhood();
    this.createPlayer();
    this.createCompanion();
    this.createControls();
    this.dialogue = new DialogueBox(this);
    this.virtualPad = new VirtualPad(this);

    this.startIntro();
  }

  private createPixelTextures(): void {
    const textures = [
      { key: "pizza-bad-pepperoni", colors: [0xcc0000, 0xff6666] },
      { key: "pizza-bad-cheese", colors: [0xffeb3b, 0xfff59d] },
      { key: "pizza-bad-mushroom", colors: [0x8d6e63, 0xbcaaa4] },
      { key: "pizza-bad-anchovy", colors: [0x607d8b, 0x90a4ae] },
      { key: "pizza-bad-pineapple", colors: [0xffc107, 0xffe082] },
      { key: "pizza-bad-chili", colors: [0x2e7d32, 0x66bb6a] },
    ];

    textures.forEach((t) => {
      if (this.textures.exists(t.key)) return;
      const g = this.add.graphics();
      g.fillStyle(t.colors[0], 1);
      g.fillCircle(16, 16, 14);
      g.fillStyle(t.colors[1], 1);
      g.fillCircle(10, 10, 5);
      g.generateTexture(t.key, 32, 32);
      g.destroy();
    });

    if (!this.textures.exists("pizza-tray")) {
      const g = this.add.graphics();
      g.fillStyle(0xd2b48c, 1);
      g.fillEllipse(40, 15, 80, 30);
      g.lineStyle(3, 0x8b4513, 1);
      g.strokeEllipse(40, 15, 80, 30);
      g.generateTexture("pizza-tray", 80, 30);
      g.destroy();
    }

    if (!this.textures.exists("pizza-bg")) {
      const g = this.add.graphics();
      g.fillStyle(0x3e2723, 1);
      g.fillRect(0, 0, 800, 600);
      g.fillStyle(0x5d4037, 1);
      for (let i = 0; i < 800; i += 40) {
        g.fillRect(i, 0, 20, 600);
      }
      g.generateTexture("pizza-bg", 800, 600);
      g.destroy();
    }
  }

  private buildNeighborhood(): void {
    // Fondo real del vecindario
    this.add
      .image(400, 300, "bg-vecindario")
      .setDisplaySize(800, 600)
      .setDepth(-10)
      .setScrollFactor(0);

    // Puerta pizzería (zona invisible sobre la puerta de la imagen)
    this.pizzeriaDoor = this.add.zone(680, 420, 80, 100).setDepth(0);
    this.physics.world.enable(this.pizzeriaDoor);

    this.obstacles = this.physics.add.staticGroup();

    // Paredes invisibles según el fondo
    this.addWall(400, -10, 800, 20); // arriba (cielo)
    this.addWall(400, 545, 800, 40); // abajo (calle)
    this.addWall(-10, 300, 20, 600); // izquierda
    this.addWall(810, 300, 20, 600); // derecha

    // Vallas del parque
    this.addFurniture(60, 280, 10, 300, 0x000000, 0);
    // Banco del parque (colisión invisible)
    this.addFurniture(120, 375, 100, 30, 0x000000, 0);
    // Pizzería pared frontal
    this.addFurniture(700, 280, 200, 20, 0x000000, 0);
    // Mesas de la pizzería
    this.addFurniture(600, 370, 60, 40, 0x000000, 0);
    this.addFurniture(760, 370, 60, 40, 0x000000, 0);
  }

  private addWall(x: number, y: number, w: number, h: number): void {
    const wall = this.add.rectangle(x, y, w, h, 0x000000, 0).setDepth(1);
    this.physics.add.existing(wall, true);
    this.obstacles.add(wall);
  }

  private addFurniture(
    x: number,
    y: number,
    w: number,
    h: number,
    color: number,
    alpha: number,
  ): void {
    const f = this.add.rectangle(x, y, w, h, color, alpha).setDepth(1);
    this.physics.add.existing(f, true);
    this.obstacles.add(f);
  }

  private createPlayer(): void {
    this.player = new Player(this, 80, 480);
    this.physics.add.collider(this.player.getSprite(), this.obstacles);
  }

  private createCompanion(): void {
    // Sarah esperando en el banco del parque
    const initialFrame = 0;
    this.companion = this.physics.add
      .sprite(200, 340, "sarah", initialFrame)
      .setScale(0.5);
    this.companion.setImmovable(true);
    this.companion.setDepth(2);

    const body = this.companion.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);

    this.companionLabel = this.add
      .text(200, 300, "Amor ❤️", {
        fontSize: "14px",
        color: "#ffffff",
        fontFamily: '"Courier New", monospace',
        backgroundColor: "#ff69b4",
      })
      .setOrigin(0.5)
      .setDepth(3);

    // Burbuja de diálogo flotante
    this.companionBubble = this.add
      .text(200, 270, "¡Laura!", {
        fontSize: "16px",
        color: "#000000",
        fontFamily: '"Courier New", monospace',
        backgroundColor: "#ffffff",
      })
      .setOrigin(0.5)
      .setDepth(3);

    this.tweens.add({
      targets: this.companionBubble,
      y: this.companionBubble.y - 8,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });
  }

  private createControls(): void {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    }) as { [key: string]: Phaser.Input.Keyboard.Key };

    this.spaceKey = this.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE,
    );
  }

  private startIntro(): void {
    this.player.setFrozen(true);
    this.state = "intro";

    this.dialogue.show(
      [
        "Laura: ¿Por dónde se habrán ido?",
        "Amor: ¡Laura! ¡Aquí estoy! Te estaba esperando.",
        "Laura: ¡Ay, qué bueno verte, amor! Me robaron a Kiari.",
        "Amor: Lo sé. Encontré una pista: el villano ama la pizza.",
        "Laura: Entonces vamos a la pizzería.",
        "Amor: Pero primero ayúdame a preparar pizzas para los clientes.",
        "Laura: ¡Claro! Soy experta en comer pizzas, no en hacerlas...",
      ],
      () => {
        this.state = "playing";
        this.player.setFrozen(false);

        this.add
          .text(400, 580, "Acércate a mí o entra a la pizzería", {
            fontSize: "18px",
            color: "#ffffff",
            fontFamily: '"Courier New", monospace',
            backgroundColor: "#00000080",
          })
          .setOrigin(0.5)
          .setDepth(100)
          .setScrollFactor(0);
      },
    );
  }

  private tryTalkToCompanion(): void {
    const dist = Phaser.Math.Distance.Between(
      this.player.getSprite().x,
      this.player.getSprite().y,
      this.companion.x,
      this.companion.y,
    );

    if (dist < 100 && this.state === "playing") {
      this.startPizzaGame();
    }
  }

  private tryEnterPizzeria(): void {
    const nearDoor = Phaser.Geom.Intersects.RectangleToRectangle(
      this.player.getSprite().getBounds(),
      this.pizzeriaDoor.getBounds(),
    );

    if (nearDoor && this.state === "playing") {
      this.dialogue.show([
        "Laura: La pizzería está cerrada hasta que terminemos el pedido.",
        "Amor: ¡Vamos, acércate a mí para empezar el minijuego!",
      ]);
    }
  }

  private startPizzaGame(): void {
    this.state = "pizza-intro";
    this.player.setFrozen(true);

    this.dialogue.show(
      [
        "Amor: Necesitamos 15 ingredientes buenos para la pizza especial.",
        "Amor: Atrapa pimiento, champiñón, queso y pizza.",
        "Amor: Si atrapas sardina o chile, pierdes un corazón.",
        "Laura: ¡Perfecto! Prepararé una pizza especial.",
        "Amor: Ja ja ja, vamos, amor, tú puedes.",
      ],
      () => {
        this.showPizzaInstructions();
      },
    );
  }

  private showPizzaInstructions(): void {
    const key = "pizza-panel";
    if (!this.textures.exists(key)) {
      const g = this.add.graphics();
      g.fillStyle(0x000000, 0.92);
      g.fillRect(0, 0, 620, 380);
      g.lineStyle(4, 0xff69b4, 1);
      g.strokeRect(0, 0, 620, 380);
      g.generateTexture(key, 620, 380);
      g.destroy();
    }

    const bg = this.add.image(400, 300, key).setDepth(600).setScrollFactor(0);

    const title = this.add
      .text(400, 130, "PIZZA RUSH", {
        fontSize: "36px",
        color: "#ffeb3b",
        fontFamily: '"Courier New", monospace',
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(601)
      .setScrollFactor(0);

    const text = this.add
      .text(
        400,
        265,
        [
          "Atrapa pimiento, sardina, champiñón, queso y pizza",
          "Usa ← → o A/D para mover la bandeja",
          "",
          "SARDINA y CHILE = pierdes 1 corazón",
          "Objetivo: 15 ingredientes",
          "Tiempo: 45 segundos",
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
      .setDepth(601)
      .setScrollFactor(0);

    const btn = this.add
      .text(400, 400, "EMPEZAR", {
        fontSize: "28px",
        color: "#000000",
        fontFamily: '"Courier New", monospace',
        fontStyle: "bold",
        backgroundColor: "#32cd32",
      })
      .setOrigin(0.5)
      .setDepth(602)
      .setScrollFactor(0)
      .setInteractive({ cursor: "pointer" });

    btn.on("pointerdown", () => {
      bg.destroy();
      title.destroy();
      text.destroy();
      btn.destroy();
      this.launchPizzaRush();
    });
  }

  private launchPizzaRush(): void {
    this.state = "pizza-game";
    this.pizzaScore = 0;
    this.pizzaLives = 3;
    this.pizzaTimeLeft = 45;
    this.fallingItems = [];

    // Ocultar elementos del vecindario durante el minijuego
    this.companion.setVisible(false);
    this.companionLabel.setVisible(false);
    this.companionBubble.setVisible(false);

    // Fondo del minijuego: cocina de pizzería
    this.pizzaGroup = this.add.container(0, 0);
    const bg = this.add
      .rectangle(400, 300, 800, 600, 0x3e2723)
      .setDepth(500)
      .setScrollFactor(0);
    this.pizzaGroup.add(bg);

    // Decoración cocina
    const counter = this.add
      .rectangle(400, 580, 800, 60, 0x8b4513)
      .setDepth(501)
      .setScrollFactor(0);
    this.pizzaGroup.add(counter);

    // Bandeja
    this.pizzaTray = this.add
      .image(400, 540, "pizza-tray")
      .setDepth(502)
      .setScrollFactor(0);
    this.pizzaGroup.add(this.pizzaTray);

    // UI
    this.pizzaScoreText = this.add
      .text(20, 20, "Ingredientes: 0/15", {
        fontSize: "22px",
        color: "#ffffff",
        fontFamily: '"Courier New", monospace',
        backgroundColor: "#00000088",
      })
      .setDepth(503)
      .setScrollFactor(0);
    this.pizzaGroup.add(this.pizzaScoreText);

    this.pizzaTimerText = this.add
      .text(400, 60, "45s", {
        fontSize: "36px",
        color: "#ffeb3b",
        fontFamily: '"Courier New", monospace',
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(503)
      .setScrollFactor(0);
    this.pizzaGroup.add(this.pizzaTimerText);

    // Spawner
    this.spawnTimer = this.time.addEvent({
      delay: 700,
      callback: () => this.spawnPizzaItem(),
      callbackScope: this,
      loop: true,
    });

    // Timer global
    this.gameTimer = this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.pizzaTimeLeft--;
        this.pizzaTimerText.setText(`${this.pizzaTimeLeft}s`);
        if (this.pizzaTimeLeft <= 0) {
          this.finishPizzaGame(false);
        }
      },
      callbackScope: this,
      loop: true,
    });

    this.updatePizzaLivesText();
  }

  private spawnPizzaItem(): void {
    const good = [
      {
        key: "pizza-good-pimiento",
        name: "pimiento",
        texture: "ingrediente-pimiento",
      },
      {
        key: "pizza-good-champinon",
        name: "champiñón",
        texture: "ingrediente-champinon",
      },
      { key: "pizza-good-queso", name: "queso", texture: "ingrediente-queso" },
      { key: "pizza-good-pizza", name: "pizza", texture: "ingrediente-pizza" },
    ];
    const bad = [
      {
        key: "pizza-bad-sardina",
        name: "sardina",
        texture: "ingrediente-sardina",
      },
      {
        key: "pizza-bad-chile",
        name: "chile",
        texture: "ingrediente-pimiento",
      },
    ];

    const isGood = Math.random() > 0.35;
    const pool = isGood ? good : bad;
    const def = pool[Math.floor(Math.random() * pool.length)];

    const x = Phaser.Math.Between(50, 750);
    const sprite = this.add
      .image(x, -30, def.texture)
      .setDisplaySize(64, 64)
      .setDepth(501)
      .setScrollFactor(0)
      .setOrigin(0.5);

    this.pizzaGroup.add(sprite);
    this.fallingItems.push({
      sprite,
      type: isGood ? "good" : "bad",
      key: def.key,
    });
  }

  private updatePizzaGame(delta: number): void {
    const dt = delta / 1000;
    const speed = 260;

    // Movimiento bandeja
    const left =
      this.cursors.left.isDown || this.wasd.left.isDown || this.virtualPad.left;
    const right =
      this.cursors.right.isDown ||
      this.wasd.right.isDown ||
      this.virtualPad.right;

    if (left && this.pizzaTray.x > 60) this.pizzaTray.x -= 420 * dt;
    if (right && this.pizzaTray.x < 740) this.pizzaTray.x += 420 * dt;

    // Mover ingredientes
    for (let i = this.fallingItems.length - 1; i >= 0; i--) {
      const item = this.fallingItems[i];
      item.sprite.y += speed * dt;

      const trayBounds = this.pizzaTray.getBounds();
      const itemBounds = item.sprite.getBounds();

      if (Phaser.Geom.Intersects.RectangleToRectangle(trayBounds, itemBounds)) {
        this.collectItem(item, i);
      } else if (item.sprite.y > 620) {
        item.sprite.destroy();
        this.fallingItems.splice(i, 1);
      }
    }

    if (this.pizzaScore >= 15) {
      this.finishPizzaGame(true);
    } else if (this.pizzaLives <= 0) {
      this.finishPizzaGame(false);
    }
  }

  private collectItem(item: FallingItem, index: number): void {
    item.sprite.destroy();
    this.fallingItems.splice(index, 1);

    if (item.type === "good") {
      this.pizzaScore++;
      this.pizzaScoreText.setText(`Ingredientes: ${this.pizzaScore}/15`);

      // Partícula de felicidad
      this.createSparkle(item.sprite.x, item.sprite.y, 0x00ff00);
    } else {
      this.pizzaLives--;
      this.updatePizzaLivesText();

      // Sacudida
      this.cameras.main.shake(200, 0.01);
      this.createSparkle(item.sprite.x, item.sprite.y, 0xff0000);
    }
  }

  private updatePizzaLivesText(): void {
    this.pizzaLivesIcons.forEach((icon) => icon.destroy());
    this.pizzaLivesIcons = [];

    for (let i = 0; i < 3; i++) {
      const texture = i < this.pizzaLives ? "corazon" : "corazon-roto";
      const heart = this.add
        .image(28 + i * 38, 70, texture)
        .setDisplaySize(32, 32)
        .setDepth(503)
        .setScrollFactor(0);
      this.pizzaGroup.add(heart);
      this.pizzaLivesIcons.push(heart);
    }
  }

  private createSparkle(x: number, y: number, color: number): void {
    for (let i = 0; i < 6; i++) {
      const p = this.add
        .circle(x, y, 4, color)
        .setDepth(504)
        .setScrollFactor(0);
      this.tweens.add({
        targets: p,
        x: x + Phaser.Math.Between(-40, 40),
        y: y + Phaser.Math.Between(-40, 40),
        alpha: 0,
        duration: 400,
        onComplete: () => p.destroy(),
      });
    }
  }

  private finishPizzaGame(won: boolean): void {
    if (this.state === "pizza-finish") return;
    this.state = "pizza-finish";

    this.spawnTimer.remove();
    this.gameTimer.remove();

    this.fallingItems.forEach((i) => i.sprite.destroy());
    this.fallingItems = [];

    this.pizzaGroup.destroy(true);

    // Mostrar de nuevo a Sarah
    this.companion.setVisible(true);
    this.companionLabel.setVisible(true);
    this.companionBubble.setVisible(true);

    this.player.setFrozen(false);

    if (won) {
      Inventory.add({
        id: "pizza-clue",
        title: "Pista de la pizzería",
        text: "El villano pidió delivery al parque central. Lleva su pizza a las 8 PM.",
      });

      this.dialogue.show(
        [
          "Amor: ¡Lo lograste! 15 ingredientes perfectos.",
          "Cliente: Mmm, huele delicioso.",
          'Pista obtenida: "El villano pidió delivery al parque central."',
          "Laura: Entonces lo encontraré en el parque.",
          "Amor: Te acompaño, amor. Vamos a enfrentar al villano.",
          "Laura: ¡Sí, vamos a salvar a Kiari!",
        ],
        () => {
          this.scene.start("HiddenObjectScene");
        },
      );
    } else {
      this.dialogue.show(
        [
          "Amor: ¡Se acabó el tiempo o perdiste las vidas!",
          "Laura: No importa, lo intentaré de nuevo.",
          "Amor: Esa es mi chica. ¡Nunca te rindes!",
        ],
        () => {
          this.state = "playing";
          this.player.setFrozen(false);
        },
      );
    }
  }

  update(_time: number, delta: number): void {
    // Avanzar diálogo con espacio
    if (
      this.dialogue.isOpen() &&
      Phaser.Input.Keyboard.JustDown(this.spaceKey)
    ) {
      this.dialogue.advance();
      return;
    }

    if (this.state === "pizza-game") {
      this.updatePizzaGame(delta);
      return;
    }

    if (this.state !== "playing") return;

    // Botón A para hablar/entrar
    if (this.virtualPad.action) {
      this.tryTalkToCompanion();
      this.tryEnterPizzeria();
    }

    const up =
      this.cursors.up.isDown || this.wasd.up.isDown || this.virtualPad.up;
    const down =
      this.cursors.down.isDown || this.wasd.down.isDown || this.virtualPad.down;
    const left =
      this.cursors.left.isDown || this.wasd.left.isDown || this.virtualPad.left;
    const right =
      this.cursors.right.isDown ||
      this.wasd.right.isDown ||
      this.virtualPad.right;

    this.player.update(up, down, left, right);
  }
}
