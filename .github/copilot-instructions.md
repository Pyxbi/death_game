# Death Game - AI Coding Instructions

## Project Overview
A browser-based card survival game with pyramid stage visualization and waterfall progression. Players navigate through 5 stages displayed in a pyramid layout, clicking cards to earn points while avoiding bombs that cost lives.

## Architecture & Game Flow

### Pyramid Stage Layout
- **Visual Structure**: All 5 stages visible simultaneously in pyramid formation
- **Stage States**: `stage-locked` (grayed/blurred), `stage-active` (current), `stage-completed`, `stage-hidden` (waterfall effect)
- **Waterfall Progression**: Completed stages disappear, remaining stages move up visually

### Core Game Mechanics
```javascript
// Bomb distribution rule
bombs = totalCards > 4 ? 2 : 1

// Stage progression: 9→7→5→4→3 cards
// Required clicks: 3,3,2,2,2 respectively

// Give-up availability
giveUpEnabled = stagesCompleted >= 2
```

### File Structure
- `index.html` - Pyramid layout with 5 stage containers, each with info and card grid
- `styles.css` - Pyramid CSS grid, stage state transitions, waterfall animations
- `script.js` - `DeathGame` class managing pyramid states and waterfall effects

## Development Patterns

### Pyramid Stage Management
Each stage container has fixed HTML structure in pyramid order (stage-5 to stage-1). The `resetPyramid()` function initializes all stages as locked except stage-1. The `waterfallToNextStage()` handles the visual transition when stages complete.

### Stage State System
```css
.stage-locked: opacity 0.4, blur, grayscale, scaled down
.stage-active: glowing border, scaled up
.stage-completed: reduced opacity, slight blur
.stage-hidden: opacity 0, translateY(-50px), collapsed height
```

### Card Grid Layouts
Responsive grid systems per card count:
```css
.cards-9: 3x3 grid, 300px max-width
.cards-7: 3x3 grid, 250px max-width  
.cards-5: 3x3 grid, 200px max-width
.cards-4: 2x2 grid, 160px max-width
.cards-3: 3x1 grid, 150px max-width
```

### Waterfall Animation System
- `stage-hidden` class triggers collapse animation
- `translateY(-50px)` creates upward movement effect
- Transition duration: 0.5s for smooth stage progression
- Cards are smaller (60x80px) to fit pyramid layout

## Technical Implementation Notes

### State Persistence
Critical game state in `DeathGame` class:
```javascript
currentStageIndex // 0-4 for stages 1-5
stageCleared // prevents multiple clicks during transition
```

### DOM Structure Pattern
```html
<div id="stage-X" class="stage-container stage-[state]">
  <div class="stage-info">Stage X - Y cards</div>
  <div class="stage-cards grid gap-2 cards-Y"></div>
</div>
```

### Animation Timing
- Card flip: 300ms rotateY transform
- Stage waterfall: 500ms opacity + transform
- Shake effect: 820ms on bomb hit
- Button transitions: 300ms scale transforms

## Asset Dependencies
- `sentient.png` - Card front background (60% size, 30% opacity)
- `boom.jpg` - Bomb reveal image
- Tailwind CSS via CDN for base utilities
- Custom CSS for pyramid/waterfall effects

## Testing Focus Areas
- Stage state transitions between locked/active/completed/hidden
- Pyramid layout responsiveness on mobile (cards resize to 45x60px)
- Waterfall animation timing and visual smoothness
- Card grid adaptations for different stage card counts
