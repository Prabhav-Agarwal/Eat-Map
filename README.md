# 🍽️ EatMap

A vanilla JavaScript web app that finds dining spots — restaurants, cafés, bars, and fast food — near any location on an interactive map. Built as a practice project focused on **asynchronous JavaScript, third-party APIs, OOP architecture, and DOM manipulation**, with no frameworks involved.

🔗 **Live demo:(Works best with PC)** [eat-map.netlify.app](https://eat-map.netlify.app/)

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Leaflet](https://img.shields.io/badge/Leaflet.js-199900?style=flat&logo=leaflet&logoColor=white)
![Geoapify](https://img.shields.io/badge/Geoapify-API-14B8A6?style=flat)

## Features

- **Location detection** — uses the Geolocation API to find the user's current position, with reverse geocoding to auto-fill country/city
- **Manual location search** — search by country or city, or drop a pin directly on the setup map
- **Live places search** — queries the Geoapify Places API for dining spots near the chosen location
- **Category filtering** — filter results by All / Restaurants / Cafés / Bars / Fast Food via the nav bar
- **Interactive map** — Leaflet-powered map with custom category icons; clicking a place card or marker centers the map and opens its popup
- **Vegetarian indicator** — color-coded badge on each place card when diet info is available
- **Loading state** — overlay spinner while location and places data are being fetched

## Tech Stack

| Layer | Tools |
|---|---|
| 🧱 Structure/Styling | HTML5, CSS3 (custom properties, flexbox) |
| ⚙️ Logic | Vanilla JavaScript (ES2022+, classes, private fields) |
| 🗺️ Map | [Leaflet.js](https://leafletjs.com/) + OpenStreetMap tiles |
| 📍 Data | [Geoapify](https://www.geoapify.com/) Geocoding & Places APIs |

No build tools, bundlers, or frameworks — everything runs directly in the browser.

## Concepts Practiced

- **Asynchronous JS** — `async/await`, `Promise` wrapping around callback-based browser APIs (`navigator.geolocation`), chained API calls (geocode → reverse geocode → places)
- **Working with APIs** — `fetch`, `response.ok` error handling, mapping JSON responses into app data
- **OOP architecture** — three classes with private fields/methods (`#`):
  - `ModalWindow` — location-picker modal, its map, and geocoding logic
  - `Place` — a single dining spot: card markup + map marker
  - `App` — orchestrator: owns state, wires up events, coordinates the other two classes
- **DOM manipulation** — `insertAdjacentHTML`, class toggling for show/hide states, event delegation on containers instead of per-element listeners

## Project Structure

```
eatmap/
├── index.html
├── app.js
├── styleSheets/
│   ├── base.css      # resets, CSS variables, shared typography
│   ├── main.css      # main app layout (header, sidebar, cards, map)
│   └── modal.css      # location-picker modal & loader overlay
└── svgs/ images/       # marker icons and place images
```

## How It Works

1. `App` instantiates `ModalWindow`, which shows the location-picker modal and requests the user's coordinates.
2. Coordinates are reverse-geocoded to pre-fill Country/City/Location; the user can also change country/city or drop a pin on the modal map.
3. On submit, `App` fetches nearby places, wraps each result in a `Place` instance, and filters out non-dining categories.
4. Each `Place` draws its own marker (category-specific icon) and card in the sidebar.
5. Category nav clicks and card/marker clicks re-filter and re-focus the map without re-fetching — all via delegated event listeners.

## Setup

1. Clone or download this repository.
2. Get a free API key from [Geoapify](https://www.geoapify.com/) (used for geocoding and places search).
3. Open `app.js` and replace the `apiKey` constant with your own key.
4. Open `index.html` in a browser (or serve the folder with any static server) — allow location access when prompted.

## Known Limitations / Next Steps

- The Geoapify API key is currently hardcoded client-side (fine for a learning project, but should move to a backend/proxy or env variable before any real deployment).
- Search input in the header is present in the UI but not yet wired to filter results.
- No pagination/limit handling yet if the Places API returns a very large result set.

## License

MIT
