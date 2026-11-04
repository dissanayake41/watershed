# Watershed Management — IWMI Open Day

Portrait touchscreen exhibition with three interactive project stories, a Sri Lanka 3D terrain explorer and Riverkeeper.

## Open

**Public exhibition:** [https://dissanayake41.github.io/watershed/](https://dissanayake41.github.io/watershed/)

- Hosted or local server: open `index.html`.
- Offline kiosk: double-click `OPEN_Watershed_Management_V23_EXHIBITION.html`. Keep the original large portable file intact.
- Direct project links: `#mahaweli`, `#knuckles`, `#adb`; 3D: `#terrain`; Riverkeeper: `#riverkeeper`.
- The welcome screen's discreet left-edge control opens the five-option menu. Inside a project, the name in the upper right switches projects directly.

## Design and content

V22 preserves the 60 approved V21 topics and scientific datasets. It adds photographic project entrances, a chapter index with circular image previews, compact chapter headers, clearer chart/map controls and distinct green, teal and amber project accents. The source reports distinguish model estimates, observations, planned work and completed results; those distinctions are retained.

Designed at 1080 × 1920 and scaled to the available screen. JavaScript is required. The 3D explorer requires WebGL. No analytics, external fonts or runtime CDN dependencies are used.

## Static hosting

Publish `index.html`, `exhibit.html`, root JavaScript/CSS files, `.nojekyll`, `assets/` and `vendor/`. Do not publish `qa/`, research extracts or the generated portable HTML files. GitHub Pages can serve the root directory of a `main` branch. All runtime paths are relative and support repository subpaths.

## Verification

60 topics checked on the live GitHub Pages site in Edge: no JavaScript errors, missing images, invalid chart values or horizontal overflow. Offline touch checks cover map selection and zoom, figure pinch gestures, project switching, video pause/resume and the 1,040,000-triangle terrain model. The working `qa/` folder contains the detailed results and screenshots.

## Assets and rights

IWMI and CGIAR marks, project imagery, report figures and scientific data retain their owners' rights. Do not assume this repository grants a reuse license. The welcome landscape is illustrative generated media; report photography and source maps retain their provenance in each project's source notes. Three.js licensing is included under `vendor/`.

## Riverkeeper · V23

[Open Riverkeeper](https://dissanayake41.github.io/watershed/#riverkeeper). The supplied 4:49 film remains 1920 × 1080, with audio, 68 English caption cues and three chapter shortcuts. Three learning tabs explain water allocation, development choices and learning from monthly outcomes. The game opens at https://dissanayake41.github.io/riverkeeper-play/ in a separate tab.

The film is fetched only on playback or another player action. Closing the section pauses it and restores the welcome landscape. Game outcomes are educational scenarios, not forecasts for the Mahaweli. The film and its stills use illustrative generated imagery alongside game footage. No original project reports, private game source or account data are included.
