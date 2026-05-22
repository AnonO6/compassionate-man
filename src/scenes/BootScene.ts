import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    this.load.tilemapTiledJSON('map', 'assets/levels/1/map.json');
    this.load.image('tiles', 'assets/levels/1/spritesheet.png');

    this.load.image('pacman', 'assets/sprites/pacman.png');
    this.load.image('ghost-red', 'assets/sprites/ghost-red.png');
    this.load.image('ghost-pink', 'assets/sprites/ghost-pink.png');
    this.load.image('ghost-cyan', 'assets/sprites/ghost-cyan.png');
    this.load.image('ghost-orange', 'assets/sprites/ghost-orange.png');

    this.createPlaceholderTextures();
  }

  private createPlaceholderTextures(): void {
    const dotG = this.make.graphics({ x: 0, y: 0 }, false);
    dotG.fillStyle(0xffffff);
    dotG.fillCircle(3, 3, 2);
    dotG.generateTexture('dot', 6, 6);
    dotG.destroy();

    const pelG = this.make.graphics({ x: 0, y: 0 }, false);
    pelG.fillStyle(0xffffff);
    pelG.fillCircle(5, 5, 5);
    pelG.generateTexture('pellet', 10, 10);
    pelG.destroy();

    // Frightened ghost — still a placeholder until Irie provides one
    const fG = this.make.graphics({ x: 0, y: 0 }, false);
    fG.fillStyle(0x2020dd);
    fG.fillRoundedRect(1, 2, 12, 10, 4);
    fG.fillRect(1, 8, 12, 6);
    fG.fillStyle(0xffffff);
    fG.fillCircle(5, 6, 1);
    fG.fillCircle(10, 6, 1);
    fG.generateTexture('ghost-frightened', 14, 14);
    fG.destroy();
  }

  create(): void {
    this.scene.start('ArcadeScene');
  }
}
