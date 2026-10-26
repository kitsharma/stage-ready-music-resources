# Stage Ready — Elementary Music Resource Guide

A searchable, classroom-ready guide to free elementary music lessons from trusted educational and cultural organizations.

## What it does

- Browse 19 curated resources in Cards, Concert Hall, or Recording Studio views.
- Filter by grade band and musical focus, or search lesson text, materials, and standards.
- Open a lesson detail view with time, materials, standards alignment, teacher notes, and a direct source link.
- Save lessons to a Set List that persists in the browser.
- Print the Set List, save it as a PDF, or start an email with source links.
- Use the full interface on desktop, tablet, or mobile with keyboard-accessible controls.

Resource records live in `resources.json`; the interface and behavior live in `index.html`, `styles.css`, and `app.js`.

## Run locally

Because resources are loaded from JSON, serve the folder rather than opening the HTML as a `file://` URL:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Test

```sh
npm install
npx playwright install chromium
npm test
```

The smoke suite covers filtering, Set List persistence behavior, lesson details, and view switching at desktop and mobile sizes.

## Add a resource

Add one object to `resources.json`. Keep the source URL direct where the publisher provides a stable lesson page, describe rather than reproduce source material, and verify grade, materials, and standards against the original source.

## Visual asset policy

Any future image assets (stage backgrounds, studio interiors, illustrations, icons, or atmospheric artwork) must be generated with the Google Stitch MCP and saved locally under `assets/`. The current environments are CSS-only and do not use stock imagery.

Stitch project references:

- https://stitch.withgoogle.com/projects/11091067758089258234?node-id=da45338a34f441bab659057e7752a89b
- https://stitch.withgoogle.com/projects/11091067758089258234?node-id=634dd87f3e79475b9310f019c9821f45

## Deployment

The project is a static site with no build step and can be deployed directly to Vercel, GitHub Pages, or Netlify.

## Source and rights note

Stage Ready links to original publishers and does not republish their lesson content. Review the current source terms and classroom suitability before use, and preserve source attribution.
