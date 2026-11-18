import { DialogueBox } from "../utils/DialogueBox";
import { Inventory } from "../utils/Inventory";

type HiddenState = "intro" | "instructions" | "playing" | "finish";

interface HiddenItem {
  key: string;
  label: string;
  icon: string;
  x: number;
  y: number;
  found: boolean;
  sprite?: Phaser.GameObjects.Container;
  listText?: Phaser.GameObjects.Text;
}

export class HiddenObjectScene extends Phaser.Scene {
  private dialogue!: DialogueBox;
  private state: HiddenState = "intro";
  private items: HiddenItem[] = [];
  private foundCount = 0;
  private progressText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: "HiddenObjectScene" });
  }

  create(): void {
    this.createTextures();
    this.buildRoom();
    this.dialogue = new DialogueBox(this);

    this.progressText = this.add
      .text(400, 30, "Objetos: 0/5", {
        fontSize: "26px",
        color: "#ffffff",
        fontFamily: '"Courier New", monospace',
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(100);

    this.startIntro();
  }

  private createTextures(): void {}

  private buildRoom(): void {
    this.add
      .image(400, 300, "hidden-room")
      .setDisplaySize(800, 600)
      .setDepth(-10)
      .setScrollFactor(0);

    this.add
      .text(400, 75, "🔍 ENCUENTRA LOS OBJETOS", {
        fontSize: "36px",
        color: "#ff69b4",
        fontFamily: '"Courier New", monospace',
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(100);
  }

  private startIntro(): void {
    this.dialogue.show(
      [
        "Laura: El villano escondió pistas por toda la habitación.",
        "Amor: Si encontramos los objetos especiales, revelará dónde está Kiari.",
        "Laura: Vamos a buscar juntas, amor.",
      ],
      () => {
        this.showInstructions();
      },
    );
  }

  private showInstructions(): void {
    this.state = "instructions";

    const key = "hidden-panel";
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
      .text(400, 160, "OBJETOS ESCONDIDOS", {
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
          "Busca 5 objetos especiales en la escena",
          "",
          "Toca cada objeto cuando lo encuentres",
          "",
          "No hay penalización: tómate tu tiempo",
          "",
          "Pista: algunos están medio escondidos",
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
      .text(400, 420, "BUSCAR", {
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
      this.startGame();
    });
  }

  private startGame(): void {
    this.state = "playing";

    // Placeholders con emojis/texto; se reemplazan por imágenes reales
    this.items = [
      {
        key: "polaroid",
        label: "Polaroid de las chicas y perros",
        icon: "objeto-polaroid",
        x: 300,
        y: 200,
        found: false,
      },
      {
        key: "sticker",
        label: "Parejita pixel",
        icon: "objeto-sticker",
        x: 450,
        y: 122,
        found: false,
      },
      {
        key: "bouquet",
        label: "Ramo de girasoles",
        icon: "ramo",
        x: 630,
        y: 226,
        found: false,
      },
      {
        key: "ring",
        label: "Anillo de girasol",
        icon: "anillo",
        x: 703,
        y: 372,
        found: false,
      },
      {
        key: "cap",
        label: "Gorra 404",
        icon: "gorra",
        x: 137,
        y: 432,
        found: false,
      },
    ];

    this.createListUI();

    this.items.forEach((item) => {
      const container = this.add
        .container(item.x, item.y)
        .setDepth(10)
        .setScrollFactor(0);

      // Círculo clickable invisible para ampliar el área
      const hitArea = this.add
        .circle(0, 0, 35, 0xffffff, 0.001)
        .setInteractive({ cursor: "pointer" });

      const sprite =
        item.key === "cap"
          ? this.add.image(0, 0, item.icon).setDisplaySize(70, 47)
          : item.key === "sticker"
            ? this.add.image(0, 0, item.icon).setDisplaySize(50, 50)
            : this.add.image(0, 0, item.icon).setDisplaySize(70, 70);

      container.add([sprite, hitArea]);

      hitArea.on("pointerdown", () => {
        this.onItemFound(item, container);
      });

      item.sprite = container;
    });
  }

  private createListUI(): void {
    const startX = 80;
    const spacing = 150;
    const y = 555;

    this.items.forEach((item, index) => {
      const x = startX + index * spacing;

      const imageObjects = [
        "anillo",
        "gorra",
        "ramo",
        "objeto-polaroid",
        "objeto-sticker",
      ];
      if (imageObjects.includes(item.icon)) {
        this.add
          .image(x, y, item.icon)
          .setDisplaySize(42, 42)
          .setOrigin(0.5)
          .setScrollFactor(0)
          .setDepth(101);
      } else {
        this.add
          .text(x, y, item.icon, { fontSize: "28px" })
          .setOrigin(0.5)
          .setScrollFactor(0)
          .setDepth(101);
      }

      item.listText = this.add
        .text(x, y + 24, item.label, {
          fontSize: "12px",
          color: "#ffffff",
          fontFamily: '"Courier New", monospace',
          backgroundColor: "#00000088",
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(101);
    });
  }

  private onItemFound(
    item: HiddenItem,
    container: Phaser.GameObjects.Container,
  ): void {
    if (item.found) return;

    item.found = true;
    this.foundCount++;
    this.progressText.setText(
      `Objetos: ${this.foundCount}/${this.items.length}`,
    );

    if (item.listText) {
      item.listText.setText("✅ " + item.label);
      item.listText.setColor("#32cd32");
    }

    // Partículas
    this.createSparkles(container.x, container.y);

    // Animación de desaparición
    this.tweens.add({
      targets: container,
      scale: 1.5,
      alpha: 0,
      duration: 400,
      onComplete: () => {
        container.setVisible(false);
      },
    });

    if (this.foundCount === this.items.length) {
      this.finishGame();
    }
  }

  private createSparkles(x: number, y: number): void {
    for (let i = 0; i < 10; i++) {
      const p = this.add
        .circle(x, y, 5, 0xffd700)
        .setDepth(50)
        .setScrollFactor(0);
      this.tweens.add({
        targets: p,
        x: x + Phaser.Math.Between(-60, 60),
        y: y + Phaser.Math.Between(-60, 60),
        alpha: 0,
        duration: 500,
        onComplete: () => p.destroy(),
      });
    }
  }

  private finishGame(): void {
    if (this.state === "finish") return;
    this.state = "finish";

    Inventory.add({
      id: "hidden-clue",
      title: "Pista escondida",
      text: "El villano espera en la pista de baile con Kiari.",
    });

    this.dialogue.show(
      [
        "Laura: ¡Encontré todo!",
        "Amor: El último objeto reveló una nota.",
        'Pista obtenida: "El villano espera en la pista de baile con Kiari."',
        "Laura: Entonces la batalla de baile es el final.",
        "Amor: ¡Tú bailas increíble, amor! Ese villano no tiene chance.",
      ],
      () => {
        this.scene.start("DanceBattleScene");
      },
    );
  }
}
