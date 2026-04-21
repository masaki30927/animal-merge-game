# Suika Style Prototype

This is a first-stage browser prototype of a Suika-style stacking game.

## Run

Open `index.html` in a desktop browser.

If your browser blocks local file access for some reason, serve the folder with a tiny static server instead.

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

## Notes

- The visuals use colored circles and labels instead of fruit art
- Physics are intentionally lightweight and tuned for a simple prototype
- The structure is kept small so later steps can add polish and rules
