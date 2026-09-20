# FUNTECH — scroll-cinematic site

Static, frontend-only. No build step, no dependencies.

## Run it
    cd funtech
    python3 -m http.server 8000      # or: npx serve
    # open http://localhost:8000

## What's where
- `index.html`  markup for hero, About, Activities, Events, Join, footer
- `style.css`   design tokens (top of file) + all styles
- `main.js`     `CONFIG` at the top controls timing, frames, contact details
- `frames2/`, `frames2_m/`  second clip (Flagship events), same settings as below
- `frames/`     240 frames (1920px, 24fps) for desktop
- `frames_m/`   120 frames (1600px, 12fps) for mobile
- `assets/`     logo.png + posters/
- `source/hero.mp4`  original clip

## Swap the clip
    rm -f frames/* frames_m/*
    ffmpeg -i source/hero.mp4 -an -vf "fps=24,unsharp=5:5:0.8:5:5:0.0" -c:v libwebp -quality 88 -preset picture frames/f_%04d.webp
    ffmpeg -i source/hero.mp4 -an -vf "fps=12,scale=1600:-2:flags=lanczos,unsharp=5:5:0.7:5:5:0.0" -c:v libwebp -quality 86 -preset picture frames_m/f_%04d.webp
    ls frames | wc -l ; ls frames_m | wc -l
Then put those two counts into `CONFIG.frames.desktop.count` and `CONFIG.frames.mobile.count` in `main.js`.
(Heavier page? Use `fps=16` for desktop and update the count.)

## Change timing
`CONFIG.beats` in `main.js`. Each number is a % of the pinned hero scroll.
`in:[a,b]` fades in between a and b, `out:[c,d]` fades out. `logoDock` sets when the logo flies into the navbar.
Pin length: `CONFIG.pinVh` (500 desktop, 350 mobile).

## Change copy / contact
- Hero text: `index.html`, inside `.stage`
- Meeting time, venue, join email: `CONFIG.join` in `main.js`
- IMPORTANT: replace `funtechclub@example.com` with the real club email, or the Join form opens an email to a placeholder.

## Swap logo / posters
Replace `assets/logo.png` (square, ideally 512px) and files in `assets/posters/`.

## Notes
- Mobile vs desktop frame set is chosen once at page load (breakpoint 768px).
- `prefers-reduced-motion` turns off scrub smoothing, grain animation, particles and floating.

## Second clip (Flagship events)
Sits between About and Core Activities. Same ffmpeg commands as above, with `source/flagship.mp4` and output folders `frames2/` and `frames2_m/`. Its text and timing live in `CONFIG.clips.flagship` (`main.js`) and the `#flagship` block in `index.html`.
The frames load in the background after the hero is ready, so the loader only waits for the first clip.

## Third clip (Treasure hunt)
Sits between Flagship events and Core Activities, so it's the last cinematic beat before the cards. Same ffmpeg commands as above, with `source/treasure.mp4` and output folders `frames3/` and `frames3_m/`. Its text and timing live in `CONFIG.clips.treasure` (`main.js`) and the `#treasure` block in `index.html`.
Also loads in the background after the hero is ready, alongside the flagship clip.

## Join section background video
A muted, looping video plays behind the Join form (`assets/video/join-bg.mp4`, poster `assets/video/join-bg-poster.jpg`). It's a plain `<video>` (not a scrubbed frame sequence), dimmed by `.join-bg-scrim` so the form and text stay readable. It pauses automatically when the section scrolls out of view, and stays paused (showing just the poster) under `prefers-reduced-motion`.
To swap it: replace `assets/video/join-bg.mp4` (re-encode with `ffmpeg -i new.mp4 -an -vf "scale=1920:-2" -c:v libx264 -crf 23 -movflags +faststart assets/video/join-bg.mp4`) and regenerate the poster with `ffmpeg -i assets/video/join-bg.mp4 -vframes 1 -q:v 3 assets/video/join-bg-poster.jpg`.
