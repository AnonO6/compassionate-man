import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    this.load.tilemapTiledJSON('map', 'assets/levels/1/map.json');
    this.load.image('tiles', 'assets/levels/1/spritesheet.png');

    this.createPlaceholderTextures();
  }

  private createPlaceholderTextures(): void {
    // Pac-Man: yellow circle
    const pacG = this.make.graphics({ x: 0, y: 0 }, false);
    pacG.fillStyle(0xffff00);
    pacG.fillCircle(7, 7, 6);
    pacG.generateTexture('pacman', 14, 14);
    pacG.destroy();

    // Dot: small white circle
    const dotG = this.make.graphics({ x: 0, y: 0 }, false);
    dotG.fillStyle(0xffffff);
    dotG.fillCircle(3, 3, 2);
    dotG.generateTexture('dot', 6, 6);
    dotG.destroy();

    // Power pellet: larger white circle
    const pelG = this.make.graphics({ x: 0, y: 0 }, false);
    pelG.fillStyle(0xffffff);
    pelG.fillCircle(5, 5, 5);
    pelG.generateTexture('pellet', 10, 10);
    pelG.destroy();

    // Ghost colors
    const ghostColors = [0xff0000, 0xffb8ff, 0x00ffff, 0xffb852];
    const ghostNames = ['ghost-red', 'ghost-pink', 'ghost-cyan', 'ghost-orange'];
    for (let i = 0; i < 4; i++) {
      const g = this.make.graphics({ x: 0, y: 0 }, false);
      g.fillStyle(ghostColors[i]);
      g.fillRoundedRect(1, 2, 12, 10, 4);
      g.fillRect(1, 8, 12, 6);
      // Eyes
      g.fillStyle(0xffffff);
      g.fillCircle(5, 5, 2);
      g.fillCircle(10, 5, 2);
      g.fillStyle(0x0000ff);
      g.fillCircle(5, 5, 1);
      g.fillCircle(10, 5, 1);
      g.generateTexture(ghostNames[i], 14, 14);
      g.destroy();
    }

    // Frightened ghost: blue
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
