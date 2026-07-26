# Detection & Response

The defender's field notes: hands-on DFIR, threat hunting, and detection engineering, from alert
to answer. Sibling of the [Malware Analysis Series](https://shaddy43.github.io/MalwareAnalysisSeries/)
— that series is the offence, this one is the defence.

**Live site:** https://shaddy43.github.io/DetectionAndResponse/

A static site: no build step, no dependencies. Plain HTML, one shared stylesheet, one small
JavaScript file. Open `index.html` in a browser and it works.

## Posts

| # | Post | Date |
|---|---|---|
| 01 | [From Alert to Answer: AI-Driven DFIR with Claude Code & Velociraptor](posts/from-alert-to-answer.html) | 23 Jul 2026 |

## Layout

```
.
├── index.html                     # Landing page and post list
├── posts/                         # One HTML file per post
│   └── from-alert-to-answer.html
├── detections/                    # Runnable rules published by the posts — see detections/README.md
│   ├── velociraptor/
│   └── yara/
└── assets/
    ├── css/style.css              # The entire stylesheet, light + dark
    ├── js/site.js                 # Theme toggle, code-block copy buttons
    ├── fonts/                     # Self-hosted JetBrains Mono (variable woff2 subsets)
    └── img/
        ├── site/                  # Site-wide images (avatar, social preview)
        │   ├── cover.png          # Source artwork, 1254×1254
        │   └── og-cover.png       # 1200×630 crop-safe card used by og:image
        └── posts/<post-slug>/     # Everything belonging to one post
```

The rule for assets: **anything used by exactly one post lives under
`assets/img/posts/<post-slug>/`**, named for what it shows (`hero.jpg`, `architecture.png`).
Anything reused across the site lives in `assets/img/site/`. That keeps `assets/` from turning
into a flat pile as posts accumulate.

## Adding a post

1. Copy the most recent file in `posts/` to `posts/<slug>.html` and rewrite the body.
2. Update the `<head>`: `title`, `description`, `canonical`, the `og:`/`twitter:` tags, and the
   `BlogPosting` JSON-LD block (headline, description, `datePublished`, `mainEntityOfPage`).
   These are per-post — copying them over unchanged is the easy mistake.
3. Drop images in `assets/img/posts/<slug>/` as **WebP**. Always set `width`/`height` on `<img>`
   so the page doesn't jump while loading, and `loading="lazy"` on everything below the hero.
   Leave `decoding` unset on the hero — `decoding="async"` lets the browser paint the page before
   the image decodes, which is the opposite of what you want for the largest element on screen.

   For encoding, the format matters less than the mode. Screenshots, diagrams and other flat-colour
   images compress better **lossless** than lossy and stay pixel-perfect; photographs need lossy
   (quality 85 is a good default). Check both before committing — on this site lossless beat
   lossy by 2-3× on every screenshot.
4. If the post publishes a rule or artifact, add the file under `detections/` (see
   [`detections/README.md`](detections/README.md)), list it in that index table, and link it from
   the post with a `.detection-links` block.
5. Add a `.post-card` to `index.html` under *Latest Posts*, and update the table above. Give the
   card a `data-tags` attribute — lowercase, pipe-separated, e.g.
   `data-tags="dfir|sigma|threat hunting"`. The filter bar builds its tag chips from those
   attributes at load time, so a new tag appears on the index by itself; there is no separate list
   to maintain. Search matches the card's visible text and its tags.

Code blocks get a copy button automatically — any `<pre>` inside `.article` is wired up by
`site.js` at load time. No markup needed.

## Theming

`assets/css/style.css` defines every colour as a CSS custom property in `:root`. Dark mode
re-declares that same set of tokens; nothing else in the stylesheet knows which theme is active.
To adjust a colour, change the token in both palettes — don't hardcode a hex value further down
the file.

The theme follows the visitor's OS preference by default. The header toggle overrides it and
persists the choice to `localStorage` under `dr-theme`. A small inline script in each page's
`<head>` applies the saved choice before first paint so there's no flash of the wrong palette.

## Analytics

[GoatCounter](https://www.goatcounter.com/) — privacy-friendly, cookieless, no consent banner
needed. `count.js` is loaded from each page's `<head>` and counts page views on its own; the click
handler in `site.js` adds events for **outbound** links only.

Internal links are deliberately not tracked as events: navigating to them already produces a page
view for the destination, so counting the click too would double-count.

Events report into the same GoatCounter account as the portfolio and the Malware Analysis Series,
so every name is prefixed `DetectionAndResponse-` to keep the three sites apart.

Two ways a link gets an event name:

1. **Automatic** — any link to another host becomes
   `DetectionAndResponse-outbound-<slugified link text>`. Nav links, whoami socials and references
   need no markup.
2. **Explicit** — add `data-event="DetectionAndResponse-outbound-<name>"` when the link text would
   slugify badly or ambiguously. The certification badges use this (their text is two spans, e.g.
   "GREM" + "GIAC / SANS"), as do the detection-file links (several read just "raw", which would
   otherwise collide).

When adding a post, outbound links work with no action. Add `data-event` only if the post publishes
download links you want to count individually.

## Credits

Posts and detection content by [Shayan Ahmed Khan (@shaddy43)](https://github.com/shaddy43).
Typeface is [JetBrains Mono](https://www.jetbrains.com/lp/mono/) (OFL), self-hosted.
