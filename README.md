# Upgrade RUNACOS — campaign arena

A gold-and-blue sci-fi campaign experience built with HTML, CSS, React, Three.js, React Three Fiber, and Drei. The arena sits inside a layered futuristic city, with illuminated towers, reflective glass, skybridges, a wet-looking plaza, moving searchlights, aerial traffic, and a suspended candidate display. The stage, architecture, objects, and animated virtual audience cast and receive shadows.

## City rendering

The **Cinematic / Balanced** button chooses the visual detail level. Cinematic adds planar ground reflections, blurred reflections, volumetric searchlight beams, HDR bloom, and higher-resolution shadows. Balanced keeps the city geometry, material lighting, aerial traffic, and directional shadows while reducing rendering cost. Small screens and devices reporting fewer CPU cores start in Balanced; desktop screens normally start in Cinematic. The choice is remembered in the current browser.

The city uses physically based metal and coated-glass materials, locally generated window/emission and surface textures, a local reflection environment, distance haze, and animated clouds. It needs no remote model or HDR asset downloads. A lightweight CSS skyline appears while the 3D scene loads or if WebGL is unavailable.

- `src/world/TechCity.jsx`: buildings, reflective plaza, skybridges, street lights, searchlights, sky, and flying vehicles.
- `src/world/materials.js`: procedural window, roughness, and normal textures.
- `src/world/city-layout.mjs`: deterministic architecture placement, keeping the stage sightline open.
- `src/world/CinematicEffects.jsx`: HDR bloom and output tone mapping.
- `src/ArenaScene.jsx`: camera, stage, audience, shadows, and scene composition.

## Start and build

```sh
npm install
npm run dev
npm run build
npm run preview
```

Use `npm.cmd` on PowerShell systems that block `npm.ps1`. Deploy the generated `dist` directory to a static host. Google Fonts requires internet access; system fonts are available as fallbacks. No external 3D models are required.

## Candidate templates (separate JSX files)

- `src/components/CandidateCarousel.jsx`: independent carousel with automatic rotation, previous/next controls, candidate selectors, swipe/drag gestures, and keyboard navigation.
- `src/components/CandidateCard.jsx`: the reusable floating slide template. Its portrait, name, position, statement, and entire clickable link can be changed through candidate data.
- `src/components/CandidatePortrait.jsx`: portrait renderer with a designed fallback while photos are missing.
- `src/data/campaign.js`: permanent candidate content and recurring theme image. This is the file to edit when you are ready to add the real names, details, portraits, and links.

Each candidate accepts:

```js
{
  id: 'candidate-id',
  name: 'Candidate name',
  position: 'Position',
  statement: 'Short text on the floating card (up to 240 characters).',
  detail: 'Full statement on the built-in profile page.',
  image: '/images/candidate.jpg',
  link: 'https://your-destination.com',
  initials: 'CN',
  configured: true
}
```

A filled `link` opens that destination. An empty link opens the built-in profile at `?candidate=candidate-id`. Add image files to `public/images/`. John Mamuda and ICT Director are taken from the existing page title; the remaining entries are explicitly empty candidate slots, with no invented candidates or endorsements.

## Theme image and Scene Studio

Set `campaign.themeImage` to `/images/theme.png` to scatter that image throughout the scene and use it in the brand mark. Designed emblem placeholders appear until it is supplied.

**Scene studio** previews candidate names, positions, descriptions, portraits, destination links, and recurring theme artwork. Studio uploads accept JPG, PNG, WebP, or GIF up to 1.5 MB each. Edits are stored only in the current browser. To make changes visible to all visitors, update the source configuration and rebuild. If browser storage is full, changes remain available for the current visit with an explanatory message.

## Navigation

- The first-visit popup has four short navigation steps. The fixed **Navigation guide** button reopens it at any time.
- Swipe/drag the stage, use the arrow buttons, or use Left/Right when the stage is focused. Home/End selects the first/last candidate.
- Tap a side card to bring it forward; tap the front card to open its profile or campaign URL.
- **AUTO** pauses or resumes carousel rotation. Interaction pauses automatic cycling so links are easier to select.
- **View as list** opens a readable directory of all candidates.
- **Motion** pauses the animated scene and CSS motion. OS reduced-motion settings are respected. Animation stops when the arena is out of view, the tab is hidden, or a guide/studio overlay is open.

## Checks

```sh
npm test
npm run check:render
npm run build
```

The checks cover circular navigation, candidate destinations, image slots, saved configuration, homepage rendering, and built-in profile rendering. They do not replace visual verification in a WebGL-capable browser.

The interest form saves details only on the visitor's device. It does not send email or submit to a campaign. The audience is a procedural virtual crowd, not a representation of real endorsements. Replace the illustrative campaign copy before real-world use.
