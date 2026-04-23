# Animal Merge Game

Drop cute animal plushies, merge matching animals, and grow the biggest animal you can.
This is a static browser game, so it can be published directly with GitHub Pages, Netlify, Vercel, or any static host.

## Run

Open `index.html` in a desktop browser.

If your browser blocks local file access for some reason, serve the folder with a tiny static server instead.

## Publish

To publish with GitHub Pages:

1. Push this folder to GitHub.
2. Open the repository's `Settings` -> `Pages`.
3. Set `Source` to `GitHub Actions`.
4. Run the `Publish static game` workflow if it does not start automatically.

After GitHub finishes deploying, the game will be available at:

`https://<username>.github.io/<repository-name>/`

## Controls

- Move the mouse to choose the drop position
- Click to drop the current piece
- Press `Space` to drop from the keyboard
- Press `Restart` to start over

## Current Features

- Gravity-based falling pieces
- Wall, floor, and piece collisions
- Same-piece merging into the next size
- Score display
- Warning line based game-over logic
- Restart flow

## Scoring

Merges get higher rewards as the animals grow:

`50, 150, 300, 500, 750, 1050, 1400, 1800, 2250, 2750`

## Notes

- The pieces are drawn as animal plush toys directly on the canvas
- Physics are intentionally lightweight and tuned for a simple prototype
- The structure is kept small so later steps can add polish and rules
