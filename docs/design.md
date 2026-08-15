# Design System

Chosen deliberately for this product's subject (a strategist that reads
your account like an instrument and hands back a diagnosis) — not a
default SaaS template. Two AI-generated-design clichés were explicitly
avoided: warm-cream-plus-terracotta, and near-black-plus-acid-green.

## Palette

| Token | Hex | Use |
|---|---|---|
| `--background` | `#FFFFFF` | Main canvas |
| `--secondary` / `--muted` | `#F3F5F1` | Card backgrounds, subtle fills |
| `--foreground` | `#14231C` | Body text (deep forest-black-green) |
| `--primary` | `#1F6F4A` | Primary actions, needle, "growth" signal |
| `--accent` | `#E8853A` | Score fills, highlights — warm counterpoint to the green |
| `--muted-foreground` | `#6B7568` | Secondary text (sage-gray) |
| `--sidebar` | `#0F1B14` | Sidebar surface (deep ink-green, distinct from the white canvas) |

## Typography

- **Display** (`--font-display`, Space Grotesk): headings — geometric,
  has character, used with restraint (weights 500–700 only).
- **Body** (`--font-sans`, Inter): everything else — high legibility for
  a data-dense dashboard.
- **Mono** (`--font-mono`, JetBrains Mono): every number — scores,
  metrics, counts. Applied via the `.font-mono` utility. This is the
  through-line that makes data feel "read off an instrument" rather than
  decorated.

## Signature element

`src/components/social-score-dial.tsx` — the Social Score rendered as an
analog instrument dial (240° sweep, tick marks, needle, amber fill),
instead of the generic "big number + small label" card. It appears on
both the landing page (as an illustrative example, explicitly labeled
"Exemplo") and the dashboard (real score once computed — `null` renders
an honest "SEM DADOS" empty state instead of a fake number).

## Layout

Sidebar (dark ink-green, fixed) + white content canvas — not the
broadsheet/hairline-rule pattern. Cards: 1px border, `--radius: 0.7rem`
(deliberately not zero-radius, not pill-shaped).

## Empty states

Every dashboard section with no data yet uses `EmptyState`
(`src/components/dashboard/empty-state.tsx`) with product-voice copy that
explains what's missing and, where relevant, what to do next — never a
fabricated placeholder number. See `docs/ai-engine.md` / `CLAUDE.md` for
the "never fabricate" rule this follows from.
