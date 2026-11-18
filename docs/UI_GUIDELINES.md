# UI guidelines

## Language

- All UI labels, titles, navigation, empty states, helper text, and future chart axis/legend titles are in **Spanish**.
- All source code, file names, TypeScript identifiers, comments, JSDoc, logs, and project documentation are in **English**.
- Route paths stay in English (`/trends`, `/geography`, `/catalog`).

## Target user

Primary user: **Content Marketing Strategist**.

The product should answer campaign and positioning questions, not engineering ones: format mix (movies vs series), where titles come from, which genres dominate, how the catalog grew over time, and which titles match a brief. Density is acceptable; decoration is not.

## Visual direction

Clean, modern analytics shell. Neutral zinc surfaces, dark by default, with a restrained crimson accent (media/Netflix cue without copying the consumer brand). Generous spacing, thin borders, no ornamental illustration.

## Design tokens

Tokens live in `frontend/src/index.css` (Tailwind v4 `@theme` + CSS variables).

| Token | Role |
| --- | --- |
| `--background` / `--foreground` | Page canvas and body text (zinc) |
| `--card` | Chart and KPI containers |
| `--muted` / `--muted-foreground` | Skeleton fills, secondary labels |
| `--primary` | Crimson accent: active controls, key KPI emphasis, `chart-1` |
| `--sidebar` | App chrome |
| `--border` / `--input` / `--ring` | Hairline chrome; ring follows crimson |
| `--chart-1` ... `--chart-5` | Crimson + zinc/slate series |
| `--radius` | 0.625rem, slightly rounded, not pill-heavy |

Typography: Geist Variable (`--font-sans`). Body `text-sm`; page titles in the header, not oversized hero headings.

## Component rules

- Use shadcn primitives in `src/components/ui` (`button`, `skeleton`, `card`, `separator`, `badge`, `input`, `select`, `sheet`) before creating new widgets.
- Loading is the default state until FastAPI is connected: every data widget in `src/components/widgets` renders its own structurally accurate `Skeleton` while `isLoading` is true, and a Spanish error fallback with a retry button when the request fails.
- Do not add emoji in the interface.
- Prefer lucide-react for icons, at `size-4`, with `aria-hidden` when decorative.

## Layout

- Persistent left sidebar (~15rem), top header with the Spanish page title plus the global tactical filter strip (formato, período de estreno, clasificación), main canvas with `gap-6` sections.
- Overview: KPI row then two chart cards.
- Charts (later phase) should use tokenized colors only, Spanish titles, and short axis labels.
