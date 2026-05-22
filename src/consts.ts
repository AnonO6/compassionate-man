import Phaser from 'phaser';

export const TILE_SIZE = 16;
export const SCALE = 2;
export const SCALED_TILE = TILE_SIZE * SCALE;
export const PLAYER_SPEED = 120;
export const GHOST_SPEED = 100;

export const PATH_TILE = 8;

export const SPRITE_SIZE = 96;
export const SPRITE_SCALE = (SCALED_TILE * 0.85) / SPRITE_SIZE;

export const DIRECTIONS = {
  LEFT:  new Phaser.Math.Vector2(-1, 0),
  RIGHT: new Phaser.Math.Vector2(1, 0),
  UP:    new Phaser.Math.Vector2(0, -1),
  DOWN:  new Phaser.Math.Vector2(0, 1),
  NONE:  new Phaser.Math.Vector2(0, 0),
} as const;
