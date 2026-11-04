# Upper Watershed Management — V26 ADB dashboard preview

Live exhibition: https://dissanayake41.github.io/watershed/
Dashboard: https://dissanayake41.github.io/watershed/#adb-dashboard

V26 adds a separate ADB dashboard to the six-option exploration menu. The original detailed ADB study, Upper Mahaweli, Knuckles, 3D terrain and Riverkeeper remain available. V25 welcome artwork, animation and title are unchanged.

## Three presentation views

1. Basin priorities: linked eight-basin map and vulnerability ranking, followed by the Uma Oya selection rationale.
2. Uma Oya findings: linked sub-basin sediment map and leading contributions, shared hotspots, seasonal river flow and measured pesticide detections.
3. Restoration outlook: monthly climate projections, a separate conservation comparison and practical planning implications.

Tap a map or bar to select an area. Enlarge maps for smaller sub-basins. Tap a month for its data. Sources & scope identifies report tables, periods and limitations. Open detailed study returns to the complete ADB presentation.

## Colour system

Each view uses a distinct IWMI accent pair: orange/gold for basin priorities, teal/green for findings, and green/sky blue for the outlook. Codes were checked against https://branding.iwmi.org/our-colours/. Ordered map colours show vulnerability or contribution classes; colours are not satellite land cover.

## Evidence

The dashboard uses the existing approved ADB_DATA geometry/statistics and report values already in adb.js. Primary sources: Rapid Assessment (8 May 2026), Eco-Hydrological Assessment (August 2026), and Final Report (26 October 2026). Source reports and research folders are not published.

Measured water quality, modelled flows and erosion, and future scenarios are explicitly distinguished. Conservation benefits are potential modelled effects; no completed intervention or measured restoration impact is claimed. InVEST and SWAT+ estimates are not combined. Climate and conservation scenarios are separate comparisons.

## Local use

Open OPEN_Upper_Watershed_Management_V26.html for the complete portable offline exhibition; select ADB dashboard. All assets are embedded. The new dashboard requires no external library or service.

The Web ZIP contains index.html and its local assets. Serve its folder over HTTP, or publish the static files through GitHub Pages. No build step is required.

## Verification

Three 1080 x 1920 portrait views fit without scrolling. Map/bar selection, keyboard access, enlarged maps, month values, climate switching, detailed-study handoff, and background-video pause were checked. Existing scientific modules and all media assets match V25 byte for byte. Screenshots and checks are in qa/ in the local delivery folder; they are not published.
