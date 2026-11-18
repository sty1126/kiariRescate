import { DialogueBox } from "../utils/DialogueBox";
import { Inventory } from "../utils/Inventory";

type MemoryState = "intro" | "instructions" | "playing" | "finish";

interface Card {
  id: number;
  pairId: number;
  sprite: Phaser.GameObjects.Sprite;
  isFlipped: boolean;
  isMatched: boolean;
}

export class MemoryScene extends Phaser.Scene {
  private dialogue!: DialogueBox;
  private state: MemoryState = "intro";
  private cards: Card[] = [];
  private flippedCards: Card[] = [];
  private pairsFound = 0;
  private totalPairs = 8;
  private canFlip = true;
  private movesText!: Phaser.GameObjects.Text;
  private moves = 0;

  constructor() {
    super({ key: "MemoryScene" });
  }

  create(): void {
    this.buildBackground();
    this.dialogue = new DialogueBox(this);

    this.movesText = this.add
      .text(400, 40, "Pares: 0/8", {
        fontSize: "28px",
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

  private buildBackground(): void {
    this.add
      .rectangle(400, 300, 800, 600, 0x2d1b4e)
      .setDepth(-10)
      .setScrollFactor(0);

    for (let i = 0; i < 20; i++) {
      const star = this.add
        .circle(
          Phaser.Math.Between(20, 780),
          Phaser.Math.Between(20, 580),
          Phaser.Math.Between(1, 3),
          0xffffff,
        )
        .setAlpha(0.3)
        .setDepth(-5)
        .setScrollFactor(0);

      this.tweens.add({
        targets: star,
        alpha: 0.8,
        duration: 800,
        yoyo: true,
        repeat: -1,
        delay: i * 50,
      });
    }

    this.add
      .text(400, 80, "🧠 MEMORIA DE KIARI", {
        fontSize: "40px",
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
        "Amor: El villano dejó esta mesa de memoria bloqueando el camino.",
        "Laura: ¡Ya sé! Si emparejamos las cartas, se abre el paso.",
        "Amor: Tú tienes buena memoria, amor. ¡Tú puedes!",
      ],
      () => {
        this.showInstructions();
      },
    );
  }

  private showInstructions(): void {
    this.state = "instructions";

    const key = "memory-panel";
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
      .text(400, 160, "RETO DE MEMORIA", {
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
          "Encuentra los 8 pares de cartas",
          "",
          "Toca una carta para voltearla",
          "Si son iguales, quedan descubiertas",
          "",
          "¡Sin penalización por equivocarte!",
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
      .text(400, 420, "JUGAR", {
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
    this.createBoard();
  }

  private createBoard(): void {
    const cols = 4;
    const rows = 4;
    const cardSize = 72;
    const spacing = 12;
    const startX =
      400 - (cols * (cardSize + spacing)) / 2 + (cardSize + spacing) / 2;
    const startY =
      200 - (rows * (cardSize + spacing)) / 2 + (cardSize + spacing) / 2;

    // Crear pares y barajar
    const pairIds = [];
    for (let i = 0; i < this.totalPairs; i++) {
      pairIds.push(i, i);
    }
    Phaser.Utils.Array.Shuffle(pairIds);

    for (let i = 0; i < pairIds.length; i++) {
      const pairId = pairIds[i];
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (cardSize + spacing);
      const y = startY + row * (cardSize + spacing) + 80;

      const container = this.add
        .container(x, y)
        .setDepth(10)
        .setScrollFactor(0);

      const back = this.add
        .sprite(0, 0, "memory-back-real")
        .setDisplaySize(cardSize, cardSize)
        .setInteractive({ cursor: "pointer" });

      const photoKey = `memory-photo-${pairId + 1}`;
      const photoTexture = this.textures.get(photoKey);
      const photoWidth = photoTexture.source[0].width;
      const photoHeight = photoTexture.source[0].height;
      const photoMargin = Math.round(Math.min(photoWidth, photoHeight) * 0.025);

      const front = this.add
        .sprite(0, 0, photoKey)
        .setCrop(
          photoMargin,
          photoMargin,
          photoWidth - photoMargin * 2,
          photoHeight - photoMargin * 2,
        )
        .setDisplaySize(cardSize, cardSize);

      front.setVisible(false);

      container.add([front, back]);

      const card: Card = {
        id: i,
        pairId,
        sprite: back,
        isFlipped: false,
        isMatched: false,
      };

      back.on("pointerdown", () => {
        this.onCardClick(card, front, container);
      });

      this.cards.push(card);
    }
  }

  private onCardClick(
    card: Card,
    front: Phaser.GameObjects.Sprite,
    container: Phaser.GameObjects.Container,
  ): void {
    if (
      !this.canFlip ||
      card.isFlipped ||
      card.isMatched ||
      this.flippedCards.length >= 2
    )
      return;

    card.isFlipped = true;
    this.flippedCards.push(card);
    this.moves++;
    this.movesText.setText(`Pares: ${this.pairsFound}/${this.totalPairs}`);

    // Animación de volteo
    this.tweens.add({
      targets: container,
      scaleX: 0,
      duration: 150,
      onComplete: () => {
        front.setVisible(true);
        card.sprite.setVisible(false); // ocultar reverso
        this.tweens.add({
          targets: container,
          scaleX: 1,
          duration: 150,
        });
      },
    });

    if (this.flippedCards.length === 2) {
      this.checkMatch(front, container);
    }
  }

  private checkMatch(
    _front: Phaser.GameObjects.Sprite,
    _container: Phaser.GameObjects.Container,
  ): void {
    this.canFlip = false;
    const [a, b] = this.flippedCards;

    if (a.pairId === b.pairId) {
      a.isMatched = true;
      b.isMatched = true;
      this.pairsFound++;
      this.movesText.setText(`Pares: ${this.pairsFound}/${this.totalPairs}`);

      // Efecto de brillo
      this.tweens.add({
        targets: [a.sprite, b.sprite],
        alpha: 0.6,
        duration: 200,
        yoyo: true,
        repeat: 2,
      });

      this.flippedCards = [];
      this.canFlip = true;

      if (this.pairsFound === this.totalPairs) {
        this.finishGame();
      }
    } else {
      this.time.delayedCall(1000, () => {
        this.flipBack(a);
        this.flipBack(b);
        this.flippedCards = [];
        this.canFlip = true;
      });
    }
  }

  private flipBack(card: Card): void {
    const container = card.sprite
      .parentContainer as Phaser.GameObjects.Container;
    if (!container) return;

    const front = container.getAt(0) as Phaser.GameObjects.Sprite;

    card.isFlipped = false;

    this.tweens.add({
      targets: container,
      scaleX: 0,
      duration: 150,
      onComplete: () => {
        front.setVisible(false);
        card.sprite.setVisible(true);
        this.tweens.add({
          targets: container,
          scaleX: 1,
          duration: 150,
        });
      },
    });
  }

  private finishGame(): void {
    if (this.state === "finish") return;
    this.state = "finish";

    Inventory.add({
      id: "memory-clue",
      title: "Pista de la memoria",
      text: "La pizzería del vecindario tiene la siguiente pista.",
    });

    this.dialogue.show(
      [
        "Laura: ¡Lo logré! Todas las parejas encontradas.",
        "Amor: Sabía que tu memoria era impecable.",
        'Pista obtenida: "La pizzería del vecindario tiene la siguiente pista."',
        "Laura: Entonces vamos al vecindario, amor.",
      ],
      () => {
        this.scene.start("NeighborhoodScene");
      },
    );
  }
}
