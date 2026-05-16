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
│   ├── main.ts                 # Entry point, game bootstrap
│   ├── game/
│   │   ├── Game.ts             # Core game loop, state machine (ARCADE → GLITCH → EXIT)
│   │   ├── Clock.ts            # Fixed-timestep loop, delta timing
│   │   └── InputManager.ts     # Keyboard/touch input handling
│   ├── maze/
│   │   ├── Maze.ts             # Maze structure, tile grid, collision
│   │   ├── MazeRenderer.ts     # Wall rendering, name engravings
│   │   ├── WallNames.ts        # Name generation, placement, glow state
│   │   └── mazeData.ts         # Level layouts (tile maps)
│   ├── entities/
│   │   ├── Entity.ts           # Base entity class (position, velocity, tile snapping)
│   │   ├── Player.ts           # Pac-Man movement, dot eating, state
│   │   ├── Ghost.ts            # Ghost AI, state (CHASE | FLEE | RESTORED | FOLLOWING)
│   │   ├── GhostPersonality.ts # Per-ghost behavior profiles + memory fragments
│   │   └── Dot.ts              # Regular dots and memory-pellets
│   ├── systems/
│   │   ├── PhaseManager.ts     # Drives phase transitions, triggers glitch
│   │   ├── CollisionSystem.ts  # Entity-entity and entity-tile collision
│   │   ├── GlitchSystem.ts     # Visual/audio glitch effects
│   │   └── MemorySystem.ts     # Memory fragment display, ghost restoration logic
│   ├── rendering/
│   │   ├── Renderer.ts         # Canvas2D orchestrator
│   │   ├── SpriteSheet.ts      # Sprite atlas loading and slicing
│   │   ├── Particles.ts        # Particle effects (glitch sparks, name glow)
│   │   └── PostFX.ts           # Screen-level effects (static, color shift, scanlines)
│   ├── audio/
│   │   ├── AudioManager.ts     # Sound loading, playback, crossfade
│   │   └── MusicLayers.ts      # Layered music system (drop/add layers per phase)
│   ├── narrative/
│   │   ├── fragments.ts        # Memory fragment content (text, imagery per ghost)
│   │   └── Ending.ts           # Exit sequence, name engraving animation
│   └── utils/
│       ├── math.ts             # Vector ops, lerp, grid helpers
│       └── random.ts           # Seeded RNG for name placement
├── public/
│   ├── index.html
│   └── assets/
│       ├── sprites/            # Sprite sheets
│       ├── audio/              # Music layers, SFX
│       └── fonts/              # Monospace/engraving font
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

### Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Language | TypeScript | Type safety for complex state machines |
| Rendering | HTML5 Canvas 2D | No framework overhead, pixel-level control for glitch effects |
| Bundler | Vite | Fast HMR, zero-config TS support |
| Audio | Web Audio API | Layered music, real-time effects |
| Deployment | Static HTML | Single `index.html` — runs anywhere |

No game engine. No React. No dependencies beyond Vite and TypeScript. The game is ~20 files and a canvas.

---

## Implementation Plan

### Milestone 1 — Playable Pac-Man
*Get a dot-eating, ghost-dodging game running on canvas.*

- [ ] Project scaffold: Vite + TypeScript, canvas element, game loop with fixed timestep
- [ ] Maze system: tile-based grid from a 2D array, wall rendering, collision detection
- [ ] Player: grid-snapped movement, keyboard input, dot consumption
- [ ] Dots: regular dot placement, score tracking, "all dots eaten" detection
- [ ] Ghosts (x4): basic AI (chase/scatter), collision with player = death
- [ ] Power pellets: temporary ghost vulnerability, ghost consumption, respawn
- [ ] Game flow: lives, restart on death, level clear on all dots eaten
- [ ] Wall names: faint engraved text on wall tiles (randomly placed, ignorable)

**Exit criterion:** A complete, boring, faithful Pac-Man clone with names on the walls.

### Milestone 2 — The Glitch
*Break the game open.*

- [ ] Phase state machine: `ARCADE → GLITCH → EXIT`, driven by first ghost kill
- [ ] Glitch trigger: on first ghost consumption, fire a visual+audio disruption
- [ ] Glitch effects: screen shake, brief static/noise overlay, color palette shift, scanlines
- [ ] Name illumination: the killed ghost's name on the wall lights up (glow + pulse)
- [ ] Music shift: drop a layer from the music, add low ambient tone
- [ ] Ghost doesn't respawn: the consumed ghost is gone, its absence is felt
- [ ] Subtle atmosphere change: palette desaturates slightly, dot-eating sound softens

**Exit criterion:** The moment of the first ghost kill feels like something broke — not a bug, not a feature, something in between.

### Milestone 3 — Memory & Restoration
*Transform power pellets into instruments of compassion.*

- [ ] Memory pellets: power pellets visually change (glow differently, pulse slower)
- [ ] Memory fragments: touching a ghost after eating a memory pellet shows a fragment — a line of text, a brief image, a sound — unique to that ghost
- [ ] Ghost restoration: after memory fragment plays, ghost transitions from CHASE → RESTORED → FOLLOWING
- [ ] Following behavior: restored ghosts trail the player at a respectful distance, no longer threatening
- [ ] Ghost personality: each ghost has a name, a fragment, a backstory implied in 2-3 seconds of content
- [ ] Progressive atmosphere: each restoration shifts the palette warmer, adds a music layer back

**Exit criterion:** The player can restore all remaining ghosts and feel the maze transform around them.

### Milestone 4 — The Exit
*Let them leave.*

- [ ] Exit gate: hidden exit in the maze, revealed after first restoration (or after all ghosts restored)
- [ ] Procession: player moves toward exit, restored ghosts follow in a loose line
- [ ] Name engraving: player's name (entered at start? generated?) is carved into the wall in an animation
- [ ] Unrestored ghosts: if any ghosts were killed and not restored, they remain — their names glow on the wall as you pass
- [ ] Final beat: the screen holds on the maze for a moment after the player leaves. The names. The silence. Then reset.
- [ ] Maze reset: the maze returns to Phase 1, ready for the next player. The new player's engraved name is now on the wall.

**Exit criterion:** The ending is quiet, earned, and slightly haunting.

### Milestone 5 — Polish & Feel
*Make it feel like a real thing.*

- [ ] Sound design: dot-eat sounds, ghost approach sounds, glitch SFX, ambient layers
- [ ] Layered music system: 3-4 stems that add/remove based on phase and restoration count
- [ ] Touch/mobile support: swipe controls, responsive canvas sizing
- [ ] Name persistence: store previous players' names in localStorage, show them on walls in future runs
- [ ] Screen transitions: fade-in on start, hold on ending
- [ ] Performance: ensure 60fps on mid-range devices
- [ ] Accessibility: colorblind-safe palette shifts, screen reader announcements for key moments

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

Open `http://localhost:5173`. Arrow keys to move.

---

## License

MIT
