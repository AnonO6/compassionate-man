import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { ArcadeScene } from './scenes/ArcadeScene';

const TILE_SIZE = 16;
const MAP_COLS = 22;
const MAP_ROWS = 25;
const SCALE = 2;

export const GAME_WIDTH = MAP_COLS * TILE_SIZE * SCALE;
export const GAME_HEIGHT = MAP_ROWS * TILE_SIZE * SCALE;

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.CANVAS,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  pixelArt: true,
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, ArcadeScene],
};

new Phaser.Game(config);
