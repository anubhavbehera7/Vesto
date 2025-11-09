# Vesto Design System

## Color Palette

### Primary Colors
- **Pastel Green (Primary Action)**: `#b4d4b4` (light) / `#8fb48f` (dark)
- **Primary Hover**: `#a0c5a0`
- Used for: Primary buttons, progress bars, highlighting key actions

### Neutral Base
- **Background**: `#fafaf8` (light) / `#1a1a18` (dark)
- **Card Background**: `#ffffff` (light) / `#242422` (dark)
- **Foreground Text**: `#2d2d2d` (light) / `#e8e6e3` (dark)

### Text Colors
- **Primary Text**: `#2d2d2d` (light) / `#e8e6e3` (dark)
- **Secondary Text**: `#6a6a6a` (light) / `#9a9a98` (dark)
- **Body Text**: `#4a4a4a` (light) / `#b8b8b8` (dark)

### Accent Colors
- **Sage Green**: `#d4e4d8` - Used for badges, feature icons, "easy" level indicators
- **Peach**: `#f4d5c6` - Used for feature icons, "intermediate/expert" level indicators
- **Lavender**: `#e6dfe6` - Used for feature icons, "advanced" level indicators

### Borders & Backgrounds
- **Border**: `#e0ddd8` (light) / `#3a3a38` (dark)
- **Muted Background**: `#f5f4f2` (light) / `#222220` (dark)
- **Hover Background**: `#f5f4f2` (light) / `#222220` (dark)

### Feedback Colors
- **Success Background**: `#e8f4e8` (light) / `#2a3a2a` (dark)
- **Success Border**: `#b4d4b4` (light) / `#4a6a4a` (dark)
- **Error Background**: `#fce8e8` (light) / `#3a2a2a` (dark)
- **Error Border**: `#e4b4b4` (light) / `#6a4a4a` (dark)

## Typography

### Fonts
- **Primary**: Inter (sans-serif)
- **Letter Spacing**: `-0.01em` for body text

### Hierarchy
- **H1**: `text-3xl` to `text-6xl`, `font-bold`, `tracking-tight`
- **H2**: `text-2xl` to `text-3xl`, `font-bold`
- **H3**: `text-lg` to `text-xl`, `font-semibold`
- **Body**: `text-sm` to `text-xl`, `leading-relaxed`

## Components

### Buttons

#### Primary Button (Call-to-Action)
```
bg-[#b4d4b4] hover:bg-[#a0c5a0] text-[#2d2d2d]
border border-[#9cc09c] font-medium shadow-sm
```
- Used for: "Start Your Journey", "Continue to Questions", primary actions

#### Secondary Button (Outline)
```
border-[#e0ddd8] hover:bg-[#f5f4f2] text-[#2d2d2d]
```
- Used for: "Try Simulator", secondary actions

#### Ghost Button
```
hover:bg-[#f5f4f2] text-[#2d2d2d]
```
- Used for: Navigation, less prominent actions

### Cards
```
border-[#e0ddd8] bg-white hover:shadow-md transition-shadow
```
- Subtle borders with neutral tones
- Smooth shadow transition on hover
- Clean, minimalist aesthetic

### Badges

#### Level Indicators
- **Easy**: `bg-[#d4e4d8] text-[#2d2d2d] border-[#b4d4b4]`
- **Intermediate**: `bg-[#f4d5c6] text-[#2d2d2d] border-[#e4c5b6]`
- **Advanced**: `bg-[#e6dfe6] text-[#2d2d2d] border-[#d6cfd6]`
- **Expert**: `bg-[#f4d5c6] text-[#2d2d2d] border-[#e4c5b6]`

### Progress Bars
```
Background: bg-[#e8e6e3]
Indicator: bg-[#b4d4b4] (pastel green)
```

### Feature Icons
- Displayed in circular backgrounds with pastel colors
- Size: `w-12 h-12` rounded-full
- Icon size: `h-6 w-6`

## Design Principles

### 1. Minimalism
- Clean, uncluttered layouts
- Ample whitespace
- Simple geometric shapes

### 2. Consistency
- Unified color palette throughout
- Consistent spacing and sizing
- Predictable component behavior

### 3. Accessibility
- High contrast text ratios
- Clear visual hierarchy
- Readable font sizes with relaxed line height

### 4. Warmth & Approachability
- Warm neutral tones (beige/cream)
- Soft pastel accents
- Gentle transitions and hover states

### 5. Clear User Journey
- Primary actions in pastel green
- Visual hierarchy through color and size
- Labeled navigation elements

## Dark Mode

### Implementation
- **Automatic Detection**: Uses system preference via `@media (prefers-color-scheme: dark)`
- **No Manual Toggle**: Theme automatically matches user's system settings
- **Seamless Experience**: All components have both light and dark variants

## Key UI Changes

1. **Removed**: Blue/purple gradients
2. **Added**: Pastel green as primary action color
3. **Improved**: Text formatting with proper bold rendering
4. **Enhanced**: Lesson content with better spacing and list formatting
5. **Updated**: All cards and components with neutral borders
6. **Refined**: Navigation with consistent hover states
7. **Simplified**: Color scheme to monochromatic + pastel accents

