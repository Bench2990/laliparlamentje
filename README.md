# Az Országház

A browser-based, third-person architectural walk around a stylized Hungarian Parliament, Kossuth Lajos Square, and the Danube embankment. Includes a connected, walkable interpretation of the Parliament interior, a personalized entrance plaque, and harmless fictional political-figure cameos. All visitor-facing text is Hungarian.

## Run locally

Use **Node.js 20 LTS or 22 LTS** and npm.

```sh
npm install
npm run dev
```

Open **http://localhost:3000**. To try a phone on the same Wi-Fi, open `http://YOUR_COMPUTER_IP:3000` and allow the dev server through the local firewall. Mobile controls do not require pointer lock or HTTPS.

Development uses `.next-dev/`, production uses `.next/`, and browser tests use `.next-e2e/`. Separate generated folders avoid Windows file-lock conflicts when building while the dev server is open.

```sh
npm run build
npm start
```

Deploy the repository to **Vercel**, select its Next.js preset, and use the default build/output settings. No environment variables, accounts, database, API keys, or external asset host are required.

### GitHub and Vercel checklist

- Commit the application source, `public/`, `package.json`, and `package-lock.json`. Dependencies, build output, browser-test artifacts, and `.vercel/` are ignored.
- In Vercel, import the GitHub repository, select **Next.js** and **Node.js 22.x**, use `npm ci` to install and `npm run build` to build, and leave the output-directory setting at its framework default.
- Leave `NEXT_PUBLIC_E2E` **unset** in deployment environments. It is only used by the isolated browser-test server.

## Explore

- **Desktop:** WASD or arrow keys to move relative to the camera; mouse to orbit the follow camera. **E** enters/exits at the main door. **F** performs a cartoon slap near the chamber cameo. **Esc** releases the mouse. If pointer lock is unavailable, click and drag to orbit.
- **Mobile:** left analog joystick to walk, right-hand area to orbit. Independent captured pointer IDs support simultaneous gestures. Use **Belépés** / **Kilépés** at the door and **Pofon 👋** near the cameo. Portrait, landscape, and safe-area insets are supported.
- A short-brown-haired, light-skinned male avatar in a black long-sleeve top and black trousers is visible outdoors and indoors. Procedural limb motion and smooth turning provide a lightweight walk/idle animation.
- The follow camera retracts before walls, columns, room corners, and the river boundary. In very tight spaces it uses a short elevated view instead of going inside the avatar. Drag vertically to inspect the upper facade or ceilings.
- The settings button changes rendering quality without restarting the walk.
- Follow the paths around either end of the Parliament to reach the riverfront. Water and major buildings are impassable.
- Desktop and mobile share the **13.8 m/s** maximum movement speed in `src/lib/world.ts` (**9.2 × 1.5**, a 50% increase). The distance-driven walking cadence is also 50% faster; smooth acceleration, analog joystick speed, camera damping, and collision substeps are retained.

## Personalized additions

- **“Lali parlamentje”** is a gold-trimmed green architectural nameplate above the east entrance. Its high-resolution lettering uses the locally bundled Cormorant Garamond font on a real 3D plaque; it is not a screen overlay or remote text asset.
- The chamber's **Orbán-inspired Viktor caricature** slowly walks a furniture-free loop. Within 1.65 m, **F / Pofon 👋** starts an exaggerated, non-graphic cartoon gag: the player swings an open hand for 0.68 seconds; the NPC wobbles, falls backwards, rests on the floor for 1.75 seconds with orbiting stars, then stands and resumes the same route. The full sequence lasts 4.8 seconds. There is no blood, injury, damage, authentic quote, or political persuasion.
- A locally synthesized comic clap/boing plays once at the arm's impact. Web Audio is unlocked by the activating key/tap, needs no remote files, and degrades silently if unavailable. Device volume/silent mode still applies.
- The NPC pauses rather than walking into the visitor. The interaction rechecks proximity, rejects repeated activation for the whole reaction, pauses with the game/settings, and resets on scene changes. The player only pauses movement during the short arm swing; camera/mobile controls and separate **E** door interactions are retained. A lightweight collision footprint follows the reclining body.
- A **Magyar Péter-inspired fictional caricature** stands on the upper Danube promenade near the central river-facing facade, facing the river, clear of the railing, benches, and main walking path. Short brown hair, a navy smart-casual jacket, and an open-collar shirt match the existing low-poly style. This NPC has **no dialogue, prompts, or interaction**.
- Every **6.2 seconds**, he takes a phone from his pocket, studies it, winds up, and makes an exaggerated cartoon throw. One independent phone object follows the palm until release, tumbles along a parabolic arc over the railing, and disappears at the water. Eight reused splash droplets and an expanding ripple briefly mark the landing. All objects are reused, the animation pauses with the game/settings, and scene unmounting disposes its resources. This is a playful fictional gag, not a depiction of an actual event.

## Architecture and assets

**All 3D models, water, paving, flags, furnishings, and interior ornament are original procedural assets generated in the code.** No model downloads, image-based buildings, panoramic backdrops, remote textures, or paid services are used. Fonts are bundled locally from the SIL Open Font License packages `@fontsource/manrope` and `@fontsource/cormorant-garamond`; copyright notices and the font license are deployed at `/licenses/fonts.txt`. Library licenses are retained by npm.

The exterior uses reusable, instanced Gothic lancet windows and tracery, buttresses, pinnacles, projecting pavilions, a 24-rib lathed dome, lantern, stone cornices, a double-door portal, and a staircase with stone guardian lions. The city includes landscaped lawns, tree rows, benches, traditional double street lamps, a Hungarian flag, and interpretations of the Kossuth and Rákóczi memorials. The opposite bank includes simplified Saint Anne's Church, Matthias Church/Fisherman's Bastion, Buda Castle, and a Chain Bridge silhouette to the south.

The interior connects a coffered entrance hall and red-carpeted ceremonial staircase to an arched golden corridor and a red-and-gold chamber with semicircular seating, a central aisle, speaker's dais, and chandeliers.

Geographic/architectural references (consulted, not downloaded as application assets):

- [Hungarian Parliament Building](https://en.wikipedia.org/wiki/Hungarian_Parliament_Building)
- [Kossuth Square](https://en.wikipedia.org/wiki/Kossuth_Square)
- [Official Parliament visitor information](https://www.parlament.hu/web/visitors/house-of-parliament)

## Code map

```text
src/app/                     Next.js App Router, Hungarian metadata, global styles
src/components/experience/   Client-only canvas, movement, scene transitions
src/components/controls/     Captured-pointer joystick, touch look, door button
src/components/world/        Instanced Parliament, square, city, water, lighting
src/components/interior/     Entrance hall, corridor, ceremonial chamber
src/components/characters/   Shared instanced humanoids and procedural limb animation
src/components/ui/           Welcome, HUD, settings, loading and WebGL fallback
src/lib/world.ts             Metre-based world, spawns, doors, movement settings
src/lib/collisions.ts        Swept/substepped 2D collision and room-union boundaries
src/lib/model.ts             Reusable procedural model builder and palette
src/lib/interior-details.ts  Columns, arches, chandeliers, patterned floors
src/lib/follow-camera.ts     Follow-camera composition and collision-safe camera boom
src/lib/characters.ts        Character motion data and shortest-angle turning
src/lib/cameo.ts             Safe NPC path and proximity/re-entry guards
src/lib/slap.ts              Shared cartoon timeline and procedural animation poses
src/lib/slap-audio.ts        User-gesture-unlocked, synthesized clap/boing
src/lib/magyar.ts             Stationary riverfront cameo and looping phone-throw poses/arc
tests/                       Unit and real-browser WebGL tests
```

World coordinates use **+X east, +Z south, +Y up**. The Parliament's long axis is north–south; the square is east and the Danube west. Geometry is compressed to a roughly 224 m facade and 81 m dome for an approachable walking-scale interpretation. Edit `src/lib/world.ts` and the model builders together when changing entrances, obstacles, or scale.

## Performance

- Architectural elements are instanced by geometry/material, with shared geometry within each batch and per-instance colors.
- One exterior shadow-casting sun; static shadows are baked once. The interior uses one baked chamber shadow light and three limited-range, non-shadow-casting point lights.
- Capped device pixel ratio, automatic reduction under sustained low frame rate, and a manual low-detail setting. Mobile defaults to a 1024 px shadow map and reduced resolution.
- Lightweight water shader; no postprocessing, physics engine, network textures, or per-frame React state for the player.
- Scene changes free the old geometry/materials. Input is cleared on blur, visibility changes, gesture cancellation, and transitions.
- Characters reuse instanced primitive geometry and small local contact-shadow textures. They do not add shadow-casting lights or require skeletal models, downloads, or shadow-map rebaking each frame.

## Checks

```sh
npm run typecheck
npm test
npx playwright install chromium webkit
npm run test:browser
npm run build
npm run test:production
```

Browser tests start an isolated dev server on port **3100**, exercise actual WebGL rendering, measured faster movement and walking cadence, camera obstruction, entrance-sign visibility, the complete slap/fall/recovery cycle, single Web Audio playback, repeated-input rejection, Chromium mobile multitouch, touch cancellation, both door transitions, and portrait/landscape/settings. Desktop Chromium, Android-emulated Chromium, and iPhone-viewport WebKit also verify the upper-bank NPC, palm-to-flight continuity, river-directed throws, splash/ripple, repeated animation cycles, fixed phone identity/object count, stable geometry/texture counts, pause behavior, and absence of interaction prompts. These are engine/emulation checks, not certification on physical phones. Screenshots are written to the ignored `artifacts/` directory. Browser diagnostics and traces on failure are stored in `test-results/`.

The Windows Playwright WebKit build does not expose `AudioContext`; that engine checks the silent fallback, while desktop/Android-emulated Chromium checks actual audio playback. Verify sound on a physical iPhone with silent mode off before relying on iOS audio certification.

Playwright alone enables `NEXT_PUBLIC_E2E=1`, which mounts a test-only camera inspection/placement bridge and uses `.next-e2e` so it does not interfere with production output. **Do not set this variable for deployment.** The bridge is eliminated from normal production builds.

The production smoke test starts the optimized build on port **3200** and verifies real rendering, Hungarian UI, local-only asset requests, and the absence of the test navigation API.

## Intentional limitations

- This is an artistic architectural interpretation, not a survey-grade digital twin. Courtyards and the complete 691-room floor plan are not reproduced. The interior has three polished spaces rather than the official visitor route.
- The Buda skyline and bridge are distant scenery, not accessible areas. The riverfront stays on the safe upper embankment; there is no swimming or bridge crossing.
- No spatial audio, crowds, weather simulation, photoreal reflections, health/damage systems, or combat mechanics. The single NPC interaction is a non-graphic fictional cartoon gag; the focus remains architecture and exploration.
- The avatar follows the supplied written appearance description; no reference photo or third-party character model is embedded. Characters are simplified low-poly figures, not photorealistic likenesses.
- WebGL 2 and hardware acceleration are required. Real phone frame rate depends on device/GPU; low-detail mode preserves architecture while reducing rendering resolution.
