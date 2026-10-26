# Stage Ready — Elementary Music Resource Guide

Interactive browser for free, research-backed elementary music education resources. Designed for classroom teachers.

**Live prototype:** open `index.html` in any modern browser (no build step).

## Views
- **Cards** — grid of lesson cards
- **Concert Hall** — spatial stage with clickable zones
- **Recording Studio** — control room / live room / archive metaphor

## Core Features
- Filters: Grade K–2 / 3–5, Rhythm, Melody, Hands-on, Cultural
- Search across title, description, and source
- Spatial zones filter the resource list
- Set List (add / remove / clear) + “Email My Set List” (mailto with links)
- Direct source links on every card

## Free Resources Included (sample set)
- Carnegie Hall Music Educators Toolbox (K–2 and 3–5 lessons)
- Smithsonian Folkways lesson plans
- Kodály Center American Folk Song Collection
- MakingMusicFun.net
- Carnegie Hall Musical Explorers

## Ontology Zones
- Artistic Processes (Creating, Performing, Responding, Connecting)
- Musical Knowledge (Rhythm/Meter, Melody, Form, Expression)
- Musicianship (Singing, Playing, Moving, Improvising…)
- Repertoire & Culture

## MANDATORY: Image Assets via Stitch MCP

Any new or improved visual assets (stage backgrounds, studio interiors, zone illustrations, icons, atmospheric lighting, etc.) **must be generated using the Google Stitch MCP** connected in Claude Code or Codex.

**Stitch project references (use these as starting points / style guides):**
- https://stitch.withgoogle.com/projects/11091067758089258234?node-id=da45338a34f441bab659057e7752a89b
- https://stitch.withgoogle.com/projects/11091067758089258234?node-id=634dd87f3e79475b9310f019c9821f45

### Required workflow for images
1. Connect / confirm Stitch MCP is available in the coding agent.
2. Prompt Stitch to generate assets that match the dark, warm-gold concert-hall / studio aesthetic already established.
3. Export or download the generated images and place them in an `/assets` folder.
4. Update the HTML background URLs and any zone imagery to use the local assets.
5. Do **not** rely solely on external Unsplash or random stock images for the final version.

## Build-Out Tasks for Codex / Claude Code
1. Expand the `resources` array with more free lessons from the sources above (include direct URLs).
2. Add a lesson detail modal (standards alignment, materials, full description, source link).
3. Persist the Set List in `localStorage`.
4. Improve Hall and Studio visuals using **Stitch-generated** image assets (mandate above).
5. Strengthen search and add keyboard accessibility.
6. Add a simple printable / PDF export of the Set List.
7. Move resources to an external `resources.json` for easier editing.
8. Optimize for mobile.
9. Deploy to GitHub Pages, Vercel, or Netlify.

## Deployment
Single static HTML file (plus any `/assets` you add). Deploy anywhere that serves static files.

## License
Free educational use. Always attribute original sources and verify current rights for any linked materials.
