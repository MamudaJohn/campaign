# Upgrade RUNACOS - digital campus

A gold-and-blue campaign experience built with HTML, CSS, React, Three.js, React Three Fiber, and Drei. The suspended candidate display sits above a connected university and future city. Low academic buildings, a columned library, floating open books, learning displays, and a research diagram share the scene with a prominent illuminated skyline. Blue-and-gold data paths connect the labs to distant research towers. Taller stepped towers, rooftop spires, blue-and-gold window lighting, and lighter distance haze restore the city silhouette. The skyline adjusts its horizontal framing on narrow screens, with the university and candidate cards in front.

## Campus rendering

Cinematic rendering and motion are enabled automatically on every device. Soft lighting, gentle ground reflections, HDR bloom, and higher-resolution shadows are selected. There are no visitor controls to switch rendering quality or disable motion, and previously saved visual preferences are ignored.

The academic campus uses physically based stone, metal, glass, and paper materials, locally generated teaching-screen and courtyard textures, a local reflection environment, and distance haze. It needs no remote model or HDR asset downloads. The skyline uses instanced towers and locally generated window textures, without adding individual window lights. A lightweight backdrop combines the same skyline, data connections, open-book, research, code, and campus motifs while the 3D scene loads or if WebGL is unavailable. Matching academic line art continues through the lower sections.

- src/world/AcademicCampus.jsx: low academic wings, library, courtyard, learning displays, books, research orbits, and graduation cap.
- src/world/campus-materials.js: procedural academic screens, signs, and courtyard surfaces.
- src/world/campus-layout.mjs: academic architecture and two rows of research towers arranged around the open stage sightline.
- src/world/TechSkyline.jsx: distant city, atmospheric horizon, and animated data links to the campus.
- src/world/skyline-materials.js: procedural window lighting and a soft blue-and-gold horizon glow.
- src/components/CampusFallback.jsx: a quiet academic background for loading and WebGL fallback.
- src/components/AcademicMotifs.jsx: subtle academic line art behind the lower sections.
- src/world/CinematicEffects.jsx: HDR bloom and output tone mapping.
- src/ArenaScene.jsx: camera, stage, audience, shadows, and scene composition.

## Start and build

```sh
npm install
npm run dev
npm run build
npm run preview
```

Use `npm.cmd` on PowerShell systems that block `npm.ps1`. Deploy the generated `dist` directory to a static host. Google Fonts requires internet access; system fonts are available as fallbacks. No external 3D models are required.

## Candidate templates (separate JSX files)

- `src/components/CandidateCarousel.jsx`: independent carousel with automatic rotation, previous/next controls, portrait thumbnail selectors, swipe/drag gestures, and keyboard navigation.
- `src/components/CandidateCard.jsx`: the reusable floating slide template. Its portrait, name, position, and statement come from candidate data. The entire card opens the internal detail page.
- `src/components/CarouselDock.jsx`: animated orbital lights, suspension rings, and the floating platform around the cards.
- `src/components/CandidatePortrait.jsx`: portrait renderer with a designed fallback while photos are missing.
- `src/components/CampaignHub.jsx`: the bottom campaign hub, with working actions for the candidate directory, vision, and navigation guide.
- `src/data/campaign.js`: permanent candidate content and recurring theme image. This is the file to edit when you are ready to add the real names, details, portraits, and links.

On phones, cards use a larger stacked layout with 60% of their height reserved for the photograph. Framing and edge details give the display more depth while keeping the portrait clear.

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

Every card and directory entry opens the built-in detail page at `?candidate=candidate-id`. The detail page shows the full statement and details, followed by an **Explore campaign** button when `link` contains a valid HTTP(S) URL. That button opens the external destination in a new tab. A blank or invalid link shows a coming-soon note. Each candidate needs a unique `id`; photos belong in `public/images/`.

## Campaign content and theme image

Set `campaign.themeImage` to `/images/theme.png` to scatter that image throughout the scene and use it in the brand mark. Designed emblem placeholders appear until it is supplied.

All candidate names, positions, statements, portraits, destination links, and theme artwork are read directly from `src/data/campaign.js`. Visitors cannot edit candidate profiles. To publish a change, edit that file and rebuild the site. Previously saved browser overrides are ignored.

## Navigation

- The first-visit popup has short navigation steps. The fixed **Navigation guide** button reopens it at any time.
- Swipe/drag the stage, use the arrow buttons, or use Left/Right when the stage is focused. Home/End selects the first/last candidate.
- Tap a side card to bring it forward; tap the front card to read the candidate details. Use **Explore campaign** on that page to open the external link.
- The candidate carousel rotates automatically. Hovering over the cards or focusing a carousel control temporarily holds the selected candidate; cycling resumes when that interaction ends.
- **View as list** opens a readable directory of all candidates.
- The bottom **Campaign hub** replaces the form. Its actions open the candidate directory, scroll to the vision, and reopen the navigation guide.
- The visible arena runs in cinematic mode with motion enabled, including behind the navigation guide. Rendering is suspended automatically while the arena is outside the viewport or the tab is hidden.

## Checks

```sh
npm test
npm run check:render
npm run build
```

The checks cover circular navigation, candidate destinations, campus and skyline placement, homepage rendering, and built-in profile rendering. Rendering checks also verify the academic fallback theme, the campaign hub with no form, the detail-page-first navigation and external campaign button, that stored candidate overrides cannot replace campaign content, and that editing controls are absent. They do not replace visual verification in a WebGL-capable browser.

The site has no interest form or collection of visitor contact details. The audience is a procedural virtual crowd, not a representation of real endorsements. Replace the illustrative campaign copy before real-world use.
