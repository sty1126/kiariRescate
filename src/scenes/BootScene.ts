import { PixelButton } from "../utils/PixelButton";
import { Player } from "../entities/Player";

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  preload(): void {
    this.load.spritesheet("laura", "/assets/laura.png", {
      frameWidth: 200,
      frameHeight: 160,
    });
    this.load.spritesheet("kiari", "/assets/kiari.png", {
      frameWidth: 200,
      frameHeight: 160,
    });
    this.load.spritesheet("villano", "/assets/villano.png", {
      frameWidth: 200,
      frameHeight: 160,
    });
    this.load.spritesheet("sarah", "/assets/sarah.png", {
      frameWidth: 200,
      frameHeight: 160,
    });
    this.load.image("bg-casa", "/assets/bg-casa.jpg");
    this.load.image("bg-calle", "/assets/bg-calle.png");
    this.load.image("bg-almohadas", "/assets/bg-almohadas.png");
    this.load.image("bg-vecindario", "/assets/bg-vecindario.jpg");
    this.load.image("bg-inicio", "/assets/inicio.jpg");
    this.load.image("bg-busqueda", "/assets/bg-busqueda.png");
    this.load.spritesheet("obstaculos-calle", "/assets/obstaculos-calle.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet("flechas-baile", "/assets/flechas-baile.png", {
      frameWidth: 768,
      frameHeight: 512,
    });
    this.load.image("corazon", "/assets/corazon.png");
    this.load.image("corazon-roto", "/assets/corazon-roto.png");
    this.load.image("meta", "/assets/meta.png");
    this.load.image("cuarto-busqueda", "/assets/cuarto_busqueda.png");
    this.load.image("gorra", "/assets/gorra.png");
    this.load.image("anillo", "/assets/anillo.png");
    this.load.image("ramo", "/assets/ramo.png");
    this.load.image("cartas", "/assets/cartas.png");
    this.load.image("bd-dancehall", "/assets/bd-dancehall.jpg");
    this.load.image("hidden-room", "/assets/bg-busqueda.png");
    this.load.image("memory-back-real", "/assets/cartas.png");
    this.load.image("tecla-arriba", "/assets/arriba.png");
    this.load.image("tecla-abajo", "/assets/abajo.png");
    this.load.image("tecla-izquierda", "/assets/izquierda.png");
    this.load.image("tecla-derecha", "/assets/derecha.png");
    this.load.image("ingrediente-pimiento", "/assets/pimiento.png");
    this.load.image("ingrediente-sardina", "/assets/sardina.png");
    this.load.image("ingrediente-champinon", "/assets/champinon.png");
    this.load.image("ingrediente-queso", "/assets/queso.png");
    this.load.image("ingrediente-pizza", "/assets/pizza.png");
    this.load.image("final-frame", "/assets/final.png");
    this.load.image("objeto-polaroid", "/assets/polaroid.png");
    this.load.image("objeto-sticker", "/assets/sticker.png");
    for (let i = 1; i <= 8; i++) {
      this.load.image(`memory-photo-${i}`, `/assets/par${i}.jpeg`);
    }
  }

  create(): void {
    this.add
      .image(400, 300, "bg-inicio")
      .setDisplaySize(800, 600)
      .setDepth(-10);

    const anim200x160 = {
      frameWidth: 200,
      frameHeight: 160,
      rowDown: 0,
      rowUp: 3,
      rowLeft: 1,
      rowRight: 2,
      walkFrames: [0, 1, 2, 1],
      idleFrame: 0,
      scale: 0.5,
    };

    Player.createAnimations(this, { ...anim200x160, textureKey: "laura" });
    Player.createAnimations(this, { ...anim200x160, textureKey: "sarah" });
    Player.createAnimations(this, {
      ...anim200x160,
      textureKey: "kiari",
      scale: 0.4,
    });

    Player.createAnimations(this, { ...anim200x160, textureKey: "villano" });

    this.add
      .text(400, 180, "", {
        fontSize: "72px",
        color: "#ff99cc",
        fontFamily: '"Courier New", monospace',
        stroke: "#880e4f",
        strokeThickness: 8,
      })
      .setOrigin(0.5);

    this.add
      .text(400, 270, "", {
        fontSize: "20px",
        color: "#ffd700",
        fontFamily: '"Courier New", monospace',
      })
      .setOrigin(0.5);

    new PixelButton(
      this,
      400,
      500,
      220,
      70,
      "JUGAR",
      0xff69b4,
      0x880e4f,
      0x5c0a33,
      0xffb6c1,
      0xff1493,
      () => {
        this.scene.start("HouseScene");
      },
    );

    this.add
      .text(400, 575, "Toca los botones o usa el mouse", {
        fontSize: "16px",
        color: "#aaaaaa",
        fontFamily: '"Courier New", monospace',
      })
      .setOrigin(0.5);
  }
}
