# LearnEssence — Brand & Theming Guidelines

This file stores the canonical brand, theming, and UI guidelines for the LearnEssence app.

Brand personality, colors, typography, motion, and component rules are recorded here so engineers and designers have a single source of truth.

— Primary color: #4F46E5 (Indigo 600)
— Accent color: #F59E0B (Amber 500)
— Background: #F9FAFB
— Surface: #FFFFFF
— Text primary: #111827
— Text secondary: #6B7280

Typography

- Font: Inter, sans-serif
- Headings: font-semibold, tracking-tight
- Body: balanced line-height

Components

- Buttons: rounded-2xl, shadow-sm, use `bg-primary text-white` for primary
- Secondary buttons: amber accents, subdued backgrounds
- Inputs/Textareas: rounded-lg, border-gray-200, focus ring indigo
- Cards: rounded-2xl, shadow-sm, padding `p-6`

Dark Mode

- Background: #0F172A
- Surface: #1E293B
- Text primary: #F1F5F9
- Text secondary: #CBD5E1

Motion

- Use framer-motion for subtle entry transitions (opacity + translateY)
- Keep duration around 0.2–0.3s

Voice & Tone

- Calm, confident, mentor-like

Usage

- Import tokens from `lib/brand.ts` where needed
- Keep UI minimal and centered (max-w-2xl)
