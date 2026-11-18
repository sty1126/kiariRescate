import Phaser from "phaser";
import { BootScene } from "./scenes/BootScene";
import { HouseScene } from "./scenes/HouseScene";
import { StreetRaceScene } from "./scenes/StreetRaceScene";
import { NeighborhoodScene } from "./scenes/NeighborhoodScene";
import { DanceBattleScene } from "./scenes/DanceBattleScene";
import { MemoryScene } from "./scenes/MemoryScene";
import { HiddenObjectScene } from "./scenes/HiddenObjectScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: "game-container",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  backgroundColor: "#222034",
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [
    BootScene,
    HouseScene,
    StreetRaceScene,
    MemoryScene,
    NeighborhoodScene,
    HiddenObjectScene,
    DanceBattleScene,
  ],
};

new Phaser.Game(config);
console.log("Kiari Rescue iniciado");
