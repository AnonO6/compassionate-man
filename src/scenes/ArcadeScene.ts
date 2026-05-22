import Phaser from 'phaser';
import { TILE_SIZE, SCALE, SCALED_TILE, PLAYER_SPEED, GHOST_SPEED, PATH_TILE, SPRITE_SCALE } from '../consts';

interface GhostData {
  sprite: Phaser.Physics.Arcade.Sprite;
  direction: Phaser.Math.Vector2;
  turnTimer: number;
}

export class ArcadeScene extends Phaser.Scene {
  private map!: Phaser.Tilemaps.Tilemap;
  private wallLayer!: Phaser.Tilemaps.TilemapLayer;
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;
  private dots!: Phaser.Physics.Arcade.Group;
  private pellets!: Phaser.Physics.Arcade.Group;
  private ghosts: GhostData[] = [];

  private currentDir = new Phaser.Math.Vector2(0, 0);
  private nextDir = new Phaser.Math.Vector2(0, 0);

  private score = 0;
  private lives = 3;
  private scoreText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private totalDots = 0;

  private frightened = false;
  private frightenedTimer = 0;
  private readonly FRIGHTENED_DURATION = 6000;

  private playerSpawn = { col: 0, row: 0 };

  constructor() {
    super({ key: 'ArcadeScene' });
  }

  create(): void {
    this.score = 0;
    this.lives = 3;
    this.frightened = false;
    this.ghosts = [];

    this.map = this.make.tilemap({ key: 'map' });
    const tileset = this.map.addTilesetImage('spritefusion', 'tiles')!;
    this.wallLayer = this.map.createLayer('Layer_0', tileset, 0, 0)!;
    this.wallLayer.setScale(SCALE);

    this.wallLayer.setCollisionByExclusion([PATH_TILE]);

    this.createDots();
    this.createPlayer();
    this.createGhosts();
    this.createHUD();

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      up: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
  }

  private tileToWorld(col: number, row: number): { x: number; y: number } {
    return {
      x: col * SCALED_TILE + SCALED_TILE / 2,
      y: row * SCALED_TILE + SCALED_TILE / 2,
    };
  }

  private worldToTile(wx: number, wy: number): { col: number; row: number } {
    return {
      col: Math.floor(wx / SCALED_TILE),
      row: Math.floor(wy / SCALED_TILE),
    };
  }

  private isPathAt(col: number, row: number): boolean {
    const tile = this.map.getTileAt(col, row, false, 'Layer_0');
    return tile !== null && tile.index === PATH_TILE;
  }

  private findPathTiles(): { col: number; row: number }[] {
    const paths: { col: number; row: number }[] = [];
    for (let row = 0; row < this.map.height; row++) {
      for (let col = 0; col < this.map.width; col++) {
        if (this.isPathAt(col, row)) {
          paths.push({ col, row });
        }
      }
    }
    return paths;
  }

  private createDots(): void {
    this.dots = this.physics.add.group();
    this.pellets = this.physics.add.group();

    const paths = this.findPathTiles();

    // Place 4 pellets in corners of the path area
    const sorted = [...paths];
    sorted.sort((a, b) => a.row * 1000 + a.col - (b.row * 1000 + b.col));
    const pelletPositions = new Set<string>();
    if (sorted.length > 0) {
      const corners = [
        sorted[0],
        sorted[Math.min(sorted.length - 1, sorted.length - 1)],
        sorted.find(p => p.row === sorted[0].row && p.col === sorted[sorted.length - 1].col),
        sorted.find(p => p.row === sorted[sorted.length - 1].row && p.col === sorted[0].col),
      ].filter(Boolean) as { col: number; row: number }[];

      for (const c of corners) {
        const key = `${c.col},${c.row}`;
        pelletPositions.add(key);
        const pos = this.tileToWorld(c.col, c.row);
        const pellet = this.pellets.create(pos.x, pos.y, 'pellet') as Phaser.Physics.Arcade.Sprite;
        pellet.setScale(SCALE);
        (pellet as any).body.setAllowGravity(false);
        this.tweens.add({
          targets: pellet,
          alpha: 0.3,
          duration: 400,
          yoyo: true,
          repeat: -1,
        });
      }
    }

    // Place dots on all other path tiles
    for (const p of paths) {
      const key = `${p.col},${p.row}`;
      if (pelletPositions.has(key)) continue;

      const pos = this.tileToWorld(p.col, p.row);
      const dot = this.dots.create(pos.x, pos.y, 'dot') as Phaser.Physics.Arcade.Sprite;
      dot.setScale(SCALE);
      (dot as any).body.setAllowGravity(false);
    }

    this.totalDots = this.dots.getLength() + this.pellets.getLength();
  }

  private createPlayer(): void {
    // Spawn in the center-bottom area of the maze
    const paths = this.findPathTiles();
    const centerCol = Math.floor(this.map.width / 2);
    const bottomPaths = paths.filter(p => p.row > this.map.height * 0.6);
    let spawn = bottomPaths.reduce(
      (best, p) => (Math.abs(p.col - centerCol) < Math.abs(best.col - centerCol) ? p : best),
      bottomPaths[0] || paths[paths.length - 1]
    );

    this.playerSpawn = spawn;
    const pos = this.tileToWorld(spawn.col, spawn.row);
    this.player = this.physics.add.sprite(pos.x, pos.y, 'pacman');
    this.player.setScale(SPRITE_SCALE);
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(10);
    this.player.body!.setSize(SCALED_TILE * 0.8, SCALED_TILE * 0.8);
    this.player.body!.setOffset(
      (this.player.width - SCALED_TILE * 0.8 / SPRITE_SCALE) / 2,
      (this.player.height - SCALED_TILE * 0.8 / SPRITE_SCALE) / 2
    );

    this.physics.add.collider(this.player, this.wallLayer);
    this.physics.add.overlap(this.player, this.dots, this.eatDot, undefined, this);
    this.physics.add.overlap(this.player, this.pellets, this.eatPellet, undefined, this);
  }

  private createGhosts(): void {
    const ghostNames = ['ghost-red', 'ghost-pink', 'ghost-cyan', 'ghost-orange'];
    const paths = this.findPathTiles();
    const centerCol = Math.floor(this.map.width / 2);
    const centerRow = Math.floor(this.map.height / 2);

    // Spawn ghosts near the center
    const centerPaths = paths
      .map(p => ({ ...p, dist: Math.abs(p.col - centerCol) + Math.abs(p.row - centerRow) }))
      .sort((a, b) => a.dist - b.dist);

    for (let i = 0; i < 4; i++) {
      const spawnTile = centerPaths[Math.min(i, centerPaths.length - 1)];
      const pos = this.tileToWorld(spawnTile.col, spawnTile.row);
      const sprite = this.physics.add.sprite(pos.x, pos.y, ghostNames[i]);
      sprite.setScale(SPRITE_SCALE);
      sprite.setCollideWorldBounds(true);
      sprite.setDepth(9);
      sprite.body!.setSize(SCALED_TILE * 0.8, SCALED_TILE * 0.8);
      sprite.body!.setOffset(
        (sprite.width - SCALED_TILE * 0.8 / SPRITE_SCALE) / 2,
        (sprite.height - SCALED_TILE * 0.8 / SPRITE_SCALE) / 2
      );

      this.physics.add.collider(sprite, this.wallLayer);
      this.physics.add.overlap(this.player, sprite, () => this.hitGhost(i), undefined, this);

      const dirs = [
        new Phaser.Math.Vector2(-1, 0),
        new Phaser.Math.Vector2(1, 0),
        new Phaser.Math.Vector2(0, -1),
        new Phaser.Math.Vector2(0, 1),
      ];
      this.ghosts.push({
        sprite,
        direction: Phaser.Math.RND.pick(dirs).clone(),
        turnTimer: 0,
      });
    }
  }

  private createHUD(): void {
    this.scoreText = this.add.text(10, 5, 'Score: 0', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#ffffff',
    }).setDepth(100).setScrollFactor(0);

    this.livesText = this.add.text(this.scale.width - 10, 5, `Lives: ${this.lives}`, {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#ffff00',
    }).setDepth(100).setScrollFactor(0).setOrigin(1, 0);
  }

  private eatDot(_player: any, dot: any): void {
    (dot as Phaser.Physics.Arcade.Sprite).destroy();
    this.score += 10;
    this.scoreText.setText(`Score: ${this.score}`);
    this.checkWin();
  }

  private eatPellet(_player: any, pellet: any): void {
    (pellet as Phaser.Physics.Arcade.Sprite).destroy();
    this.score += 50;
    this.scoreText.setText(`Score: ${this.score}`);
    this.activateFrightened();
    this.checkWin();
  }

  private activateFrightened(): void {
    this.frightened = true;
    this.frightenedTimer = this.FRIGHTENED_DURATION;
    for (const g of this.ghosts) {
      if (g.sprite.active) {
        g.sprite.setTexture('ghost-frightened');
        g.direction.negate();
      }
    }
  }

  private endFrightened(): void {
    this.frightened = false;
    const ghostNames = ['ghost-red', 'ghost-pink', 'ghost-cyan', 'ghost-orange'];
    for (let i = 0; i < this.ghosts.length; i++) {
      if (this.ghosts[i].sprite.active) {
        this.ghosts[i].sprite.setTexture(ghostNames[i]);
      }
    }
  }

  private hitGhost(ghostIndex: number): void {
    const ghost = this.ghosts[ghostIndex];
    if (!ghost.sprite.active) return;

    if (this.frightened) {
      ghost.sprite.setActive(false).setVisible(false);
      this.score += 200;
      this.scoreText.setText(`Score: ${this.score}`);

      // Respawn ghost after delay
      this.time.delayedCall(5000, () => {
        const paths = this.findPathTiles();
        const centerCol = Math.floor(this.map.width / 2);
        const centerRow = Math.floor(this.map.height / 2);
        const spawn = paths.reduce(
          (best, p) => {
            const d = Math.abs(p.col - centerCol) + Math.abs(p.row - centerRow);
            return d < (best as any).d ? { ...p, d } : best;
          },
          { ...paths[0], d: Infinity }
        );
        const pos = this.tileToWorld(spawn.col, spawn.row);
        ghost.sprite.setPosition(pos.x, pos.y);
        ghost.sprite.setActive(true).setVisible(true);
        const ghostNames = ['ghost-red', 'ghost-pink', 'ghost-cyan', 'ghost-orange'];
        ghost.sprite.setTexture(ghostNames[ghostIndex]);
      });
    } else {
      this.playerDeath();
    }
  }

  private playerDeath(): void {
    this.lives--;
    this.livesText.setText(`Lives: ${this.lives}`);

    if (this.lives <= 0) {
      this.gameOver();
      return;
    }

    this.player.setVelocity(0, 0);
    this.currentDir.set(0, 0);
    this.nextDir.set(0, 0);

    // Brief flash then respawn
    this.player.setAlpha(0);
    this.time.delayedCall(800, () => {
      const pos = this.tileToWorld(this.playerSpawn.col, this.playerSpawn.row);
      this.player.setPosition(pos.x, pos.y);
      this.player.setAlpha(1);
    });
  }

  private gameOver(): void {
    this.player.setActive(false).setVisible(false);
    this.physics.pause();

    this.add.text(this.scale.width / 2, this.scale.height / 2, 'GAME OVER', {
      fontFamily: 'monospace',
      fontSize: '32px',
      color: '#ff0000',
    }).setOrigin(0.5).setDepth(200);

    this.add.text(this.scale.width / 2, this.scale.height / 2 + 40, 'Press SPACE to restart', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#ffffff',
    }).setOrigin(0.5).setDepth(200);

    this.input.keyboard!.once('keydown-SPACE', () => {
      this.scene.restart();
    });
  }

  private checkWin(): void {
    if (this.dots.getLength() === 0 && this.pellets.getLength() === 0) {
      this.physics.pause();
      this.add.text(this.scale.width / 2, this.scale.height / 2, 'LEVEL CLEAR', {
        fontFamily: 'monospace',
        fontSize: '32px',
        color: '#00ff00',
      }).setOrigin(0.5).setDepth(200);

      this.add.text(this.scale.width / 2, this.scale.height / 2 + 40, 'Press SPACE to restart', {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#ffffff',
      }).setOrigin(0.5).setDepth(200);

      this.input.keyboard!.once('keydown-SPACE', () => {
        this.scene.restart();
      });
    }
  }

  update(_time: number, delta: number): void {
    this.updatePlayerInput();
    this.updatePlayerMovement();
    this.updateGhosts(delta);

    if (this.frightened) {
      this.frightenedTimer -= delta;
      if (this.frightenedTimer <= 0) {
        this.endFrightened();
      }
    }
  }

  private updatePlayerInput(): void {
    const left = this.cursors.left?.isDown || this.wasd.left.isDown;
    const right = this.cursors.right?.isDown || this.wasd.right.isDown;
    const up = this.cursors.up?.isDown || this.wasd.up.isDown;
    const down = this.cursors.down?.isDown || this.wasd.down.isDown;

    if (left) this.nextDir.set(-1, 0);
    else if (right) this.nextDir.set(1, 0);
    else if (up) this.nextDir.set(0, -1);
    else if (down) this.nextDir.set(0, 1);
  }

  private updatePlayerMovement(): void {
    if (!this.player.active) return;

    const { col, row } = this.worldToTile(this.player.x, this.player.y);
    const tileCenter = this.tileToWorld(col, row);

    const snapThreshold = 4;
    const nearCenter =
      Math.abs(this.player.x - tileCenter.x) < snapThreshold &&
      Math.abs(this.player.y - tileCenter.y) < snapThreshold;

    if (nearCenter) {
      // Try the queued direction first
      if (this.nextDir.x !== 0 || this.nextDir.y !== 0) {
        const nextCol = col + this.nextDir.x;
        const nextRow = row + this.nextDir.y;
        if (this.isPathAt(nextCol, nextRow)) {
          this.currentDir.copy(this.nextDir);
        }
      }

      // Check if current direction is still valid
      const aheadCol = col + this.currentDir.x;
      const aheadRow = row + this.currentDir.y;
      if (!this.isPathAt(aheadCol, aheadRow)) {
        this.currentDir.set(0, 0);
        this.player.setVelocity(0, 0);
        this.player.setPosition(tileCenter.x, tileCenter.y);
        return;
      }
    }

    this.player.setVelocity(
      this.currentDir.x * PLAYER_SPEED,
      this.currentDir.y * PLAYER_SPEED
    );

    // Rotate player sprite to face movement direction
    if (this.currentDir.x === 1) this.player.setAngle(0);
    else if (this.currentDir.x === -1) this.player.setAngle(180);
    else if (this.currentDir.y === -1) this.player.setAngle(-90);
    else if (this.currentDir.y === 1) this.player.setAngle(90);
  }

  private updateGhosts(delta: number): void {
    for (const ghost of this.ghosts) {
      if (!ghost.sprite.active) continue;

      ghost.turnTimer -= delta;
      const { col, row } = this.worldToTile(ghost.sprite.x, ghost.sprite.y);
      const center = this.tileToWorld(col, row);
      const nearCenter =
        Math.abs(ghost.sprite.x - center.x) < 3 &&
        Math.abs(ghost.sprite.y - center.y) < 3;

      if (nearCenter && ghost.turnTimer <= 0) {
        // Collect available directions (not reverse of current, unless stuck)
        const possibleDirs: Phaser.Math.Vector2[] = [];
        const allDirs = [
          new Phaser.Math.Vector2(-1, 0),
          new Phaser.Math.Vector2(1, 0),
          new Phaser.Math.Vector2(0, -1),
          new Phaser.Math.Vector2(0, 1),
        ];

        for (const d of allDirs) {
          if (this.isPathAt(col + d.x, row + d.y)) {
            // Avoid reversing unless no other option
            if (d.x !== -ghost.direction.x || d.y !== -ghost.direction.y) {
              possibleDirs.push(d);
            }
          }
        }

        if (possibleDirs.length === 0) {
          // Stuck — allow reverse
          for (const d of allDirs) {
            if (this.isPathAt(col + d.x, row + d.y)) {
              possibleDirs.push(d);
            }
          }
        }

        if (possibleDirs.length > 0) {
          if (this.frightened) {
            // Random movement when frightened
            ghost.direction = Phaser.Math.RND.pick(possibleDirs).clone();
          } else {
            // Simple chase: prefer direction toward player
            const pTile = this.worldToTile(this.player.x, this.player.y);
            possibleDirs.sort((a, b) => {
              const aDist = Math.abs((col + a.x) - pTile.col) + Math.abs((row + a.y) - pTile.row);
              const bDist = Math.abs((col + b.x) - pTile.col) + Math.abs((row + b.y) - pTile.row);
              return aDist - bDist;
            });
            // Red chases directly, others have some randomness
            ghost.direction = possibleDirs[0].clone();
          }
          ghost.turnTimer = 100;
          ghost.sprite.setPosition(center.x, center.y);
        }
      }

      // Check if hitting a wall ahead, stop and wait for next turn
      const aheadCol = col + ghost.direction.x;
      const aheadRow = row + ghost.direction.y;
      if (!this.isPathAt(aheadCol, aheadRow) && nearCenter) {
        ghost.sprite.setVelocity(0, 0);
        ghost.turnTimer = 0;
      } else {
        const speed = this.frightened ? GHOST_SPEED * 0.6 : GHOST_SPEED;
        ghost.sprite.setVelocity(
          ghost.direction.x * speed,
          ghost.direction.y * speed
        );
      }
    }
  }
}
