# Pac-Man & Compassion

> *The ghost was a Pac-Man once — a person who entered this same maze, hopeful and hungry, and never found the way out.*

A Pac-Man game that starts as survival and ends as remembrance. You enter a maze you don't understand, consume everything in sight, destroy what frightens you — and then a glitch cracks the fiction open. The ghosts have names. They were here before you. The game becomes about leading them out.

---

## Concept

The maze is any new place — a job, a city, a system. The walls are engraved with the names of everyone who ran it before you. You don't notice them. You're too busy surviving.

Then you kill your first ghost, and the game breaks just enough to make you look.

## How It Plays

The game has three phases. The player is never told this.

### Phase 1 — The Arcade

Classic Pac-Man. Eat dots, dodge ghosts, grab power pellets, consume ghosts. The maze walls are covered in faintly engraved names — hundreds of them, etched into the surface like old graffiti. They're visible but easy to ignore. The UI, sounds, and pacing all say: *this is normal. survive.*

### Phase 2 — The Glitch

The player eats a ghost. A visual glitch ripples through the maze — brief static, a flicker. One name on the wall lights up. The ghost doesn't respawn. A beat of silence. The game continues, but something is off. Colors shift subtly. The music drops a layer.

The next power pellet doesn't make ghosts edible. Instead, touching a ghost triggers a **memory fragment** — a flash of text, an image, a sound. The ghost stops. It remembers who it was. It stops chasing. It follows you.

### Phase 3 — The Exit

An exit appears in the maze — it was always there, hidden behind a wall that's now open. The player walks toward it. Restored ghosts follow, drawn to the memory you gave back. Unrestored ghosts still roam, still lost.

The player reaches the exit. Their name is engraved into the wall. The maze resets. It waits for the next one.

### The Compassion Beat

You pass the lit name on the wall — the ghost you killed before you understood. No dialogue. No prompt. Just the choice to look or keep moving. The game notices, but never tells you what it did with that.

---

## Architecture

```
compassionate-man/
├── src/
│   ├── main.ts                 # Phaser game config, boot
│   ├── scenes/
│   │   ├── BootScene.ts        # Asset preloading, splash
│   │   ├── ArcadeScene.ts      # Phase 1: classic Pac-Man gameplay
│   │   ├── GlitchTransition.ts # The moment between phases — visual/audio break
│   │   └── ExitScene.ts        # Phase 3: procession to exit, name engraving
│   ├── entities/
│   │   ├── Player.ts           # Pac-Man: grid movement, dot eating, state
│   │   ├── Ghost.ts            # Ghost: AI modes (CHASE | SCATTER | FLEE | RESTORED | FOLLOWING)
│   │   └── Dot.ts              # Regular dots + memory pellets (phase-aware behavior)
│   ├── systems/
│   │   ├── PhaseManager.ts     # ARCADE → GLITCH → EXIT state machine, event bus
│   │   ├── GhostAI.ts          # Per-ghost targeting: Blinky/Pinky/Inky/Clyde behaviors
│   │   ├── MemorySystem.ts     # Memory fragment display, ghost restoration logic
│   │   └── WallNames.ts        # Name generation, placement on tilemap, glow state
│   ├── fx/
│   │   ├── GlitchFX.ts         # Orchestrates Phaser filters: Pixelate, ColorMatrix, camera shake
│   │   ├── AtmosphereFX.ts     # Progressive palette shifts, vignette, bloom per restoration
│   │   └── NameGlow.ts         # Glow filter on individual wall-name text objects
│   ├── audio/
│   │   └── MusicLayers.ts      # Layered music: add/remove stems per phase + restoration count
│   ├── narrative/
│   │   ├── fragments.ts        # Memory fragment content per ghost (text, image key, sound key)
│   │   └── Ending.ts           # Exit sequence, name engraving tween, final hold
│   ├── data/
│   │   ├── mazeMap.json        # Tiled-format tilemap (walls, dots, pellets, spawn points)
│   │   └── names.ts            # Name pool for wall engravings
│   └── utils/
│       └── grid.ts             # Tile↔pixel conversion, direction helpers
├── public/
│   └── assets/
│       ├── tilemaps/           # Tiled .json exports
│       ├── sprites/            # Sprite sheets (player, ghosts, dots, pellets)
│       ├── audio/              # Music stems, SFX
│       └── fonts/              # Bitmap font for wall engravings
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Language | TypeScript | Type safety for state machines and phase logic |
| Game framework | Phaser 4 | Scenes, tilemaps, arcade physics, filters, audio — all built in |
| Tilemap editor | Tiled | Industry-standard maze design, native Phaser import |
| Glitch effects | Phaser Filters | Pixelate, ColorMatrix, Glow, Bloom, Vignette — no custom shaders needed |
| Bundler | Vite | Fast HMR, `npm create @phaserjs/game@latest` scaffolds Vite by default |
| Deployment | Static HTML | `vite build` → runs anywhere |

### What Phaser Handles vs. What We Build

| Phaser gives us | We build |
|----------------|----------|
| Game loop, delta timing | Phase state machine (ARCADE → GLITCH → EXIT) |
| Scene management + transitions | Glitch transition choreography |
| Tilemap loading, rendering, collision | Maze design in Tiled, wall-name overlay system |
| Arcade physics, grid snapping | Ghost AI targeting (Blinky/Pinky/Inky/Clyde) |
| Sprite animation | Memory fragment display |
| Filter system (Glow, Pixelate, ColorMatrix) | Atmosphere progression logic |
| Audio manager, Web Audio | Layered music stem system |
| Keyboard + touch input | Narrative pacing, emotional design |
| Camera effects (shake, flash, fade) | The compassion beat |

---

## Implementation Plan

### Milestone 1 — The Faithful Clone
*A Pac-Man that feels like Pac-Man.*

- [ ] Scaffold with `npm create @phaserjs/game@latest`, Vite + TypeScript
- [ ] Design maze tilemap in Tiled: walls, paths, dot positions, ghost spawn, player spawn
- [ ] `BootScene`: preload tilemap, sprite sheets, audio
- [ ] `ArcadeScene`: load tilemap, create tile layers, enable collision on walls
- [ ] Player: grid-snapped movement using arcade physics, keyboard input (arrows + WASD)
- [ ] Dots: place as sprites on path tiles, destroy on overlap, track count
- [ ] Ghosts (x4): sprite creation, basic chase/scatter AI with per-ghost targeting
- [ ] Power pellets: 4 placed in corners, eating one sets ghosts to FLEE mode, overlap = consume ghost
- [ ] Ghost respawn: consumed ghosts return from ghost house after delay
- [ ] Game flow: 3 lives, death animation, restart, level clear when all dots eaten
- [ ] Wall names: faint bitmap-font text objects placed on wall tiles (seeded random, low alpha)
- [ ] HUD: score, lives display

**Exit criterion:** A complete, faithful Pac-Man with names on the walls that nobody looks at.

### Milestone 2 — The Break
*The first ghost kill after which nothing is the same.*

- [ ] `PhaseManager`: event-driven state machine, listens for `ghost-consumed` event
- [ ] First ghost kill triggers phase transition — ghost does NOT respawn this time
- [ ] `GlitchTransition`: camera shake → Pixelate filter ramps up then down → ColorMatrix desaturates → brief static overlay sprite → screen flash
- [ ] The killed ghost's name on the wall: find the text object, tween alpha to 1, apply Glow filter, pulse animation
- [ ] Audio shift: fade out arcade music, crossfade to sparse ambient stem, silence the dot-eat SFX briefly
- [ ] Post-glitch atmosphere: ColorMatrix stays slightly desaturated, subtle Vignette filter on camera
- [ ] Remaining ghosts continue as normal — but the player now knows something

**Exit criterion:** The moment feels uncanny. Not a crash, not a cutscene. A fracture.

### Milestone 3 — Memory & Restoration
*Power pellets become something else entirely.*

- [ ] After glitch: power pellets visually transform — new sprite frame, slower pulse tween, warmer color
- [ ] Memory pellets no longer grant FLEE mode; instead they grant a `hasMemory` flag on the player
- [ ] Ghost overlap while `hasMemory` is true: freeze gameplay, display memory fragment (text + image overlay + unique sound), tween ghost from CHASE → RESTORED
- [ ] `fragments.ts`: 3 unique fragments, one per remaining ghost — a line of text, a tone, implied in 2-3 seconds
- [ ] Restored ghost behavior: stop AI, follow player at distance using path-following, no longer lethal
- [ ] Restored ghost visual: sprite tint shifts to warm, Glow filter with low intensity
- [ ] Progressive atmosphere: each restoration shifts ColorMatrix warmer, reduces Vignette, adds a music stem back
- [ ] If player touches a ghost WITHOUT `hasMemory`: normal death (the maze is still dangerous)

**Exit criterion:** Restoring the last ghost feels like the maze exhaling.

### Milestone 4 — The Way Out
*Let them leave together.*

- [ ] Exit tile: a tile in the maze that is visually a wall in Phase 1, becomes a path after first restoration
- [ ] Exit marker: subtle visual cue (faint light, different tile) — no arrow, no prompt
- [ ] Player reaches exit tile with restored ghosts following: trigger `ExitScene`
- [ ] `ExitScene`: camera pans slowly, restored ghosts settle into a line, movement stops
- [ ] Name engraving animation: player's name (entered or generated) types itself into the wall, etched font
- [ ] The killed ghost's name: still glowing on the wall as you pass. Camera lingers on it for 2 seconds.
- [ ] Unrestored ghosts (if player killed more than one before glitch): still roaming in the background, names lit
- [ ] Final hold: the maze sits empty for 3 seconds. Names. Silence.
- [ ] Maze reset: transition back to `ArcadeScene`, the engraved name is now part of the wall names

**Exit criterion:** The ending is quiet, earned, and slightly haunting.

### Milestone 5 — Polish & Persistence
*Make it feel finished.*

- [ ] Sound design: dot-eat SFX, ghost proximity audio (gets louder as they approach), glitch noise burst, ambient loops
- [ ] Layered music: 3-4 stems (rhythm, melody, bass, pad) managed as separate audio objects, muted/unmuted per phase
- [ ] Touch/mobile: swipe input, responsive canvas scaling via Phaser's Scale Manager (`FIT` mode)
- [ ] Name persistence: store player names in localStorage, load them into wall names on future runs
- [ ] Screen transitions: fade-in on boot, scene transitions using camera fade
- [ ] Accessibility: colorblind-safe palette (avoid red/green for ghost states), high-contrast mode option

---

## Design Principles

1. **Teach nothing.** The player figures out what changed and why. No tutorials, no prompts, no "Press E to show compassion."
2. **Earn the silence.** The emotional beats work because the game was noisy and familiar first. The quiet is the punctuation.
3. **Names are not decorative.** Every name on the wall is a ghost that was. The data structure is the metaphor.
4. **The first kill is irreversible.** You cannot restore the ghost you ate before you knew. That's the point.
5. **Respect the reference.** Phase 1 should feel like actual Pac-Man — the turn, the speed, the ghost behavior. The subversion only works if the foundation is faithful.

---

## Running Locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. Arrow keys or WASD to move.

## Building for Production

```bash
npm run build
```

Output in `dist/` — a static bundle, deployable anywhere.

---

## License

MIT
