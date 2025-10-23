# Static Assets

This folder contains static files that are copied directly to the `dist/static/` folder during build.

## Required Files

### hp.png

**Purpose**: Harry Potter themed background image for the liquid animation effect

**Location**: `static/hp.png`

**Usage**:

- DB index page background (`/db/`)
- Landing page right side background (DB section)

**Requirements**:

- Format: PNG
- Recommended size: 1920x1080 or higher
- Theme: Harry Potter / Magical / Gryffindor colors
- Should work well with liquid distortion effects

**Implementation**:
Place a Harry Potter themed image named `hp.png` in this folder. The image will be loaded by the Three.js liquid background component and will have magical liquid distortion effects applied to it.

**Example sources**:

- Hogwarts castle imagery
- Golden snitch patterns
- House colors (Gryffindor: scarlet and gold)
- Magical elements (wands, books, potions)
- Parchment textures with HP branding

**Fallback**:
If the image is not found, the liquid background will display with default colors/texture.

## PDFs Folder

Contains generated PDF versions of lectures.
