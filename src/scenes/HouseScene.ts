import { Player } from '../entities/Player';
import { VirtualPad } from '../utils/VirtualPad';
import { DialogueBox } from '../utils/DialogueBox';
import { Npc } from '../entities/Npc';
import { Inventory } from '../utils/Inventory';

type HouseState = 'cutscene' | 'playing';

const KIARI_ANIM = {
  textureKey: 'kiari',
  frameWidth: 200,
  frameHeight: 160,
  rowDown: 0,
  rowUp: 3,
  rowLeft: 1,
  rowRight: 2,
  walkFrames: [0, 1, 2, 1] as number[],
  idleFrame: 0,
  scale: 0.4
};

const VILLANO_ANIM = {
  textureKey: 'villano',
  frameWidth: 200,
  frameHeight: 160,
  rowDown: 0,
  rowUp: 3,
  rowLeft: 1,
  rowRight: 2,
  walkFrames: [0, 1, 2, 1] as number[],
  idleFrame: 0,
  scale: 0.5
};

export class HouseScene extends Phaser.Scene {
  private player!: Player;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { [key: string]: Phaser.Input.Keyboard.Key };
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private obstacles!: Phaser.Physics.Arcade.StaticGroup;
  private exitDoor!: Phaser.GameObjects.Zone;
  private virtualPad!: VirtualPad;
  private dialogue!: DialogueBox;
  private state: HouseState = 'cutscene';

  constructor() {
    super({ key: 'HouseScene' });
  }

  create(): void {
    this.state = 'cutscene';
    Inventory.clear();

    this.buildRoom();
    this.createPlayer();
    this.createControls();
    this.dialogue = new DialogueBox(this);
    this.virtualPad = new VirtualPad(this);

    this.startRobberyScene();
  }

  private buildRoom(): void {
    // Fondo de la casa
    this.add.image(400, 300, 'bg-casa')
      .setDisplaySize(800, 600)
      .setDepth(-10);

    this.obstacles = this.physics.add.staticGroup();

    // Paredes invisibles según el fondo
    // La habitación es aprox 720x480, bordes beige
    this.addWall(400, 60, 720, 20);    // arriba
    this.addWall(400, 585, 720, 20);   // abajo
    this.addWall(40, 320, 20, 540);    // izquierda
    this.addWall(760, 320, 20, 540);   // derecha

    // Muebles aproximados del fondo (invisibles, solo colisión)
    // Sofá L izquierdo
    this.addFurniture(150, 440, 160, 80, 0x000000, 0);
    this.addFurniture(80, 340, 60, 160, 0x000000, 0);
    // Mesita centro
    this.addFurniture(330, 410, 80, 60, 0x000000, 0);
    // Librero arriba izquierda
    this.addFurniture(200, 150, 120, 60, 0x000000, 0);
    // Mueble TV derecha
    this.addFurniture(700, 400, 80, 120, 0x000000, 0);
    // Mueble bajo derecha
    this.addFurniture(700, 520, 120, 60, 0x000000, 0);
    // Camita Kiari arriba derecha
    this.addFurniture(700, 150, 100, 60, 0x000000, 0);

    // Puerta arriba centro
    this.exitDoor = this.add.zone(400, 80, 80, 60).setDepth(0);
    this.physics.world.enable(this.exitDoor);

    // Texto indicador de salida
    this.add.text(400, 55, 'SALIDA', {
      fontSize: '12px',
      color: '#880e4f',
      fontFamily: '"Courier New", monospace',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(10);
  }

  private addWall(x: number, y: number, w: number, h: number): void {
    const wall = this.add.rectangle(x, y, w, h, 0x000000, 0).setDepth(1);
    this.physics.add.existing(wall, true);
    this.obstacles.add(wall);
  }

  private addFurniture(x: number, y: number, w: number, h: number, color: number, alpha: number): void {
    const furniture = this.add.rectangle(x, y, w, h, color, alpha).setDepth(1);
    this.physics.add.existing(furniture, true);
    this.obstacles.add(furniture);
  }

  private createPlayer(): void {
    this.player = new Player(this, 400, 520);
    this.physics.add.collider(this.player.getSprite(), this.obstacles);
  }

  private createControls(): void {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    }) as { [key: string]: Phaser.Input.Keyboard.Key };

    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  private startRobberyScene(): void {
    this.player.setFrozen(true);

    this.dialogue.show([
      'Laura: Kiari, ¿escuchaste eso?',
      'Villano: ¡Ja! El Equipo Pelusa se lleva a Kiari.',
      'Villano: Corre si puedes... ja ja ja.',
      'Laura: ¡NO! Kiari... dejaron caer algo.'
    ], () => {
      this.playRobberyAnimation();
    });
  }

  private playRobberyAnimation(): void {
    const kiari = new Npc(this, 700, 150, KIARI_ANIM);
    const villano = new Npc(this, 400, 80, VILLANO_ANIM);

    villano.moveTo(700, 150, 2400, () => {
      kiari.destroy();
      villano.moveTo(400, 80, 3000, () => {
        villano.destroy();

        // Pista que cae
        this.add.ellipse(700, 150, 20, 20, 0xffff00).setDepth(2);
        this.add.text(700, 150, '!', {
          fontSize: '16px',
          color: '#000000'
        }).setOrigin(0.5).setDepth(3);

        Inventory.add({
          id: 'house-clue',
          title: 'Pista de la casa',
          text: 'Nos vemos en la calle. Corre si puedes.'
        });

        this.dialogue.show([
          'Pista obtenida: "Nos vemos en la calle. Corre si puedes."',
          'Laura: Tengo que salir por la puerta YA.'
        ], () => {
          this.state = 'playing';
          this.player.setFrozen(false);

          this.add.text(400, 580, 'Muévete con los botones y sal por la puerta', {
            fontSize: '18px',
            color: '#ffffff',
            fontFamily: '"Courier New", monospace',
            backgroundColor: '#00000080'
          }).setOrigin(0.5).setDepth(100);
        });
      });
    });
  }

  private tryExitDoor(): void {
    const nearDoor = Phaser.Geom.Intersects.RectangleToRectangle(
      this.player.getSprite().getBounds(),
      this.exitDoor.getBounds()
    );

    if (nearDoor) {
      this.scene.start('StreetRaceScene');
    }
  }

  update(): void {
    // SPACE para avanzar diálogo (alternativa de teclado)
    if (this.dialogue.isOpen() && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.dialogue.advance();
      return;
    }

    // Botón A solo para acciones cuando no hay diálogo
    if (!this.dialogue.isOpen() && this.virtualPad.action && this.state === 'playing') {
      this.tryExitDoor();
    }

    if (this.state !== 'playing') return;

    const up = this.cursors.up.isDown || this.wasd.up.isDown || this.virtualPad.up;
    const down = this.cursors.down.isDown || this.wasd.down.isDown || this.virtualPad.down;
    const left = this.cursors.left.isDown || this.wasd.left.isDown || this.virtualPad.left;
    const right = this.cursors.right.isDown || this.wasd.right.isDown || this.virtualPad.right;

    this.player.update(up, down, left, right);
  }
}
