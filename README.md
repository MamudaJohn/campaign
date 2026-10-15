# Upgrade RUNACOS - digital campus

A gold-and-blue campaign experience built with HTML, CSS, React, Three.js, React Three Fiber, and Drei. The suspended candidate display sits above a connected university and future city. Low academic buildings, a columned library, floating open books, learning displays, and a research diagram share the scene with a prominent illuminated skyline. Blue-and-gold data paths connect the labs to distant research towers. Taller stepped towers, rooftop spires, blue-and-gold window lighting, and lighter distance haze restore the city silhouette. The skyline adjusts its horizontal framing on narrow screens, with the university and candidate cards in front.

## Campus rendering

Motion is enabled automatically, with rendering adapted to the device. Phones, touch devices, slow connections, data savers, and constrained computers use the animated lightweight skyline, campus, audience, and CSS 3D candidate carousel. They do not download or run the WebGL scene. Capable desktops load the 3D background after the page becomes interactive. There are no visitor quality or motion switches.

The academic campus uses physically based stone, metal, glass, and paper materials, locally generated teaching-screen and courtyard textures, a local reflection environment, and distance haze. It needs no remote model or HDR asset downloads. The skyline uses instanced towers and locally generated window textures, without adding individual window lights. The lightweight backdrop combines the same skyline, data connections, open-book, research, code, and campus motifs. It is the default on phones and the fallback while desktop 3D loads or when a GPU cannot sustain the scene. Matching academic line art continues through the lower sections.

- src/world/AcademicCampus.jsx: low academic wings, library, courtyard, learning displays, books, research orbits, and graduation cap.
- src/world/campus-materials.js: procedural academic screens, signs, and courtyard surfaces.
- src/world/campus-layout.mjs: academic architecture and two rows of research towers arranged around the open stage sightline.
- src/world/TechSkyline.jsx: distant city, atmospheric horizon, and animated data links to the campus.
- src/world/skyline-materials.js: procedural window lighting and a soft blue-and-gold horizon glow.
- src/components/CampusFallback.jsx: a quiet academic background for loading and WebGL fallback.
- src/components/AcademicMotifs.jsx: subtle academic line art behind the lower sections.
- src/components/AdaptiveBackdrop.jsx: device policy, deferred desktop 3D, animated lightweight stage and crowd, and GPU failure recovery.
- src/world/FrameBudget.jsx: 30 FPS request budget, adaptive pixel ratio, and persistent-slow-frame fallback.
- src/lib/performance.mjs: conservative device selection and shared render limits.
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

The front photo has a persistent gold **Meet [candidate]** action and a tap cue. It stays visible on touchscreens; hover and keyboard focus add a gentle portrait zoom, raised action, and gold frame. Side photos say **Bring forward** to explain the first tap. A readable invitation above the stage and swipe guidance below the controls explain navigation without opening the guide.

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

Every card and directory entry opens a static detail page at `/candidates/candidate-id/`. Previously shared `?candidate=candidate-id` links still work. The detail page shows the full statement and details, followed by an **Explore campaign** button when `link` contains a valid HTTP(S) URL. That button opens the external destination in a new tab. A blank or invalid link shows a coming-soon note. Each candidate needs a unique `id`; photos belong in `public/images/`.

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
- The visible arena keeps motion enabled, with an automatic lightweight or 3D background. Offscreen/hidden animations are suspended. The desktop scene uses one cached shadow map, an 84-person crowd, no live mirror or HDR postprocessing, and a capped render rate. Mobile CSS removes expensive blur/filter layers while retaining the floating cards and scene movement.

## Checks

```sh
npm test
npm run check:render
npm run build
npm run check:production
```

The checks cover circular navigation, candidate destinations, campus and skyline placement, device selection, SEO metadata and canonical handling, homepage rendering, and built-in profile rendering. The production build generates complete HTML and verifies that the 3D engine is not an initial import. Rendering checks also verify the academic fallback theme, the campaign hub with no form, the detail-page-first navigation and external campaign button, that stored candidate overrides cannot replace campaign content, and that editing controls are absent. They do not replace visual verification in a WebGL-capable browser.

The site has no interest form or collection of visitor contact details. The audience is a procedural virtual crowd, not a representation of real endorsements. Replace the illustrative campaign copy before real-world use.

## Performance and search deployment

`npm run build` now creates complete HTML for the homepage, every candidate page, and the 404 page. It also creates `robots.txt` and a canonical sitemap for `https://mamudajohn.com/`, with titles, descriptions, social sharing tags, and JSON-LD. Identical copied templates consolidate to one canonical profile; unconfigured slots are not indexed.

See [CLOUDFLARE-DEPLOY.md](CLOUDFLARE-DEPLOY.md) for Cloudflare build settings and Google Search Console steps. These source changes do not publish themselves or guarantee a Google listing. No Google verification token or Cloudflare account credential is stored in the project.
