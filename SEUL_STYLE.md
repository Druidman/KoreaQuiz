# Seoul Pop – restyling Skibidi quiz
 
Visual reference (canvas): https://claude.ai/artifact/FvsD2tWgDhg57NJEfyFD9z
Artboards: "Seoul Pop – przewodnik stylu" + 4 phone screens (start, closed question, open question with <=5 s left, thank-you).
 
## Scope
 
- **Change only the look**: colors, fonts, radii, shadows, borders, decorations, animations.
- **Do NOT change**: layout/structure of screens, component logic, state flow, Supabase calls, copy (all Polish text stays as is), element order.
- Stack: Next.js App Router + Tailwind v4 (`@theme inline` in `app/globals.css`). Keep it that way.
- Files to touch: `app/layout.tsx`, `app/globals.css`, `components/decor.tsx`, `components/JoinCard.tsx`, `components/QuizCard.tsx`, `components/ThankYouCard.tsx`, `components/QuizFlow.tsx` (error alert only), `components/ResultsBoard.tsx` (tokens + decor only).
## Look in one paragraph
 
White-dominant (>=70% of every screen is #FFFFFF), K-pop pastel-pop accents, flat vector "sticker" decorations with a 2.5 px dark outline and hard offset shadows (no blur, ever). Cards and buttons have deliberately uneven corner radii. Stickers are slightly rotated, each at a different angle. Korean hangul appears only as decorative stickers. Answer options are marked with outlined shapes ○ △ □ ☆ (letter A–D inside). Headings use a yellow highlighter stripe instead of the red wavy underline.
 
## 1. Fonts (`app/layout.tsx`)
 
Replace Poppins with three `next/font/google` fonts:
 
```ts
import { Unbounded, Nunito, Jua } from "next/font/google";
 
const display = Unbounded({ variable: "--ff-unbounded", subsets: ["latin", "latin-ext"], weight: ["600", "700", "800"] });
const sans = Nunito({ variable: "--ff-nunito", subsets: ["latin", "latin-ext"], weight: ["500", "600", "700", "800"] });
// Hangul stickers only. Jua has NO Polish diacritics – never use it for Polish text.
const hangul = Jua({ variable: "--ff-jua", weight: "400", subsets: ["latin"], preload: false });
 
// <html className={`${display.variable} ${sans.variable} ${hangul.variable} h-full antialiased`}>
```
 
`viewport.themeColor` → `#ffffff`.
 
Usage:
- Unbounded 800, tracking -0.02em: H1 ("Skibidi quiz", "Szacuneczek…"), "Pytanie N", big headings in results.
- Nunito: everything else. Question text 20–24 px / 800, options 16–18 px / 700, helper 14 px / 600, footers 12–14 px / 700.
- Jua: hangul stickers only, `aria-hidden`.
## 2. Tokens (`app/globals.css`)
 
Replace the `@theme inline` block:
 
```css
@theme inline {
  --color-paper: #ffffff;      /* page + cards, dominant */
  --color-blush: #fff1f6;      /* inputs, unselected options, panels */
  --color-ink: #1e1533;        /* text, outlines, sticker shadows */
  --color-ink-soft: #5b5070;   /* secondary text, counters */
  --color-pink: #ff4f9a;       /* decor, progress fill */
  --color-pink-deep: #d3166c;  /* primary button, selected option (white text, 5.2:1) */
  --color-pink-press: #b8105c; /* primary hover */
  --color-pink-soft: #ffb8d6;  /* card shadows, focus shadow */
  --color-mint: #2ed3b7;       /* decor, timer dot, success badge */
  --color-mint-deep: #0b7a6a;  /* success text */
  --color-butter: #ffe14d;     /* highlighter, washi tape, stickers */
  --color-lilac: #a98bff;      /* decor only, sparingly */
  --color-alert: #e11d48;      /* timer <=5 s, errors */
  --font-sans: var(--ff-nunito), ui-sans-serif, system-ui, sans-serif;
  --font-display: var(--ff-unbounded), ui-sans-serif, system-ui, sans-serif;
  --font-hangul: var(--ff-jua), sans-serif;
}
```
 
Old → new token mapping (replace every class usage):
 
| old | new |
|---|---|
| `cream` (input/option bg) | `blush` |
| `cream` (text on dark button) | `white` |
| `card` (card bg) | `paper` |
| `ink` | `ink` (new value) |
| `ink-soft` | `ink-soft` |
| `accent` | `pink-deep` (buttons/selected) or `pink` (decor/progress) |
| `accent-deep` | `pink-press` |
| `redline` | `alert` |
| `cocoa` | `ink` |
| `cocoa/60`, `cocoa/70` etc. | `ink-soft` (no opacity on text – keeps contrast) |
| `ok` | `mint-deep` |
 
Body:
 
```css
body {
  background-color: #ffffff;
  background-image: radial-gradient(#ffd6e7 1.2px, transparent 1.6px); /* sparse pink dots */
  background-size: 26px 26px;
  color: var(--color-ink);
  font-family: var(--ff-nunito), ui-sans-serif, system-ui, sans-serif;
}
```
 
Utilities (replace `.wavy-underline`, keep the other keyframes but recolor):
 
```css
/* yellow highlighter behind a word – replaces the red wavy underline */
.hl {
  background: linear-gradient(transparent 58%, var(--color-butter) 58%, var(--color-butter) 92%, transparent 92%);
  padding: 0 4px;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
}
 
/* gentle float for stickers (replaces .float-squiggle) */
@keyframes bob { 0%,100% { translate: 0 0 } 50% { translate: 0 -6px } }
.bob  { animation: bob 3.4s ease-in-out infinite; }
.bob2 { animation: bob 4.1s ease-in-out infinite reverse; }
 
.sticker-shadow { filter: drop-shadow(3px 3px 0 var(--color-ink)); }
 
@media (prefers-reduced-motion: reduce) {
  .bob, .bob2, .pulse-urgent, .pop-in, .crown-bob, .shimmer::after, .confetti-piece { animation: none !important; }
}
```
 
Keep `.pop-in`, `.pulse-urgent`, flip-card and shimmer CSS from the current file. Change the shimmer gradient color to `rgba(255,255,255,0.7)`.
 
## 3. Shape language
 
- **Outline**: `border-[2.5px] border-ink` on cards, buttons, stickers, timer pill, progress track. Unselected options and inputs: `border-[2.5px] border-ink/20`.
- **Uneven radii**: never `rounded-3xl` / `rounded-2xl` on main surfaces:
  - card: `rounded-[28px_20px_30px_18px]` (alternate: `rounded-[20px_30px_18px_28px]`)
  - primary button: `rounded-[18px_12px_18px_14px]`, ink button: `rounded-[12px_18px_14px_18px]`
  - option: `rounded-[18px_14px_20px_12px]`, input/textarea: `rounded-[16px_12px_18px_12px]`
  - pills (timer, tags): `rounded-full`
- **Shadows – hard, 0 blur**:
  - cards: `shadow-[6px_6px_0_var(--color-pink-soft)]`
  - primary button, selected option, stickers: `shadow-[4px_4px_0_var(--color-ink)]`
  - ink button: `shadow-[4px_4px_0_var(--color-pink)]`
  - pressed: `active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_var(--color-ink)]`
- Content (text, cards, buttons) is NEVER rotated. Only stickers and washi tape are.
## 4. Component recipes
 
**Card** (JoinCard form, QuizCard card, ThankYou card):
```
relative rounded-[28px_20px_30px_18px] border-[2.5px] border-ink bg-paper p-6 shadow-[6px_6px_0_var(--color-pink-soft)]
```
plus a `<Tape />` on the top edge (see decor).
 
**Primary button** ("Zaczynamy!", "Dalej"):
```
rounded-[18px_12px_18px_14px] border-[2.5px] border-ink bg-pink-deep px-5 py-3.5 text-base font-extrabold text-white shadow-[4px_4px_0_var(--color-ink)] transition enabled:hover:bg-pink-press active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_var(--color-ink)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none sm:text-lg
```
 
**Submit button** ("Wyślij odpowiedzi"):
```
rounded-[12px_18px_14px_18px] border-[2.5px] border-ink bg-ink px-5 py-3 font-extrabold text-white shadow-[4px_4px_0_var(--color-pink)] enabled:hover:bg-[#3a2e57] disabled:opacity-40 disabled:shadow-none
```
 
**Option button**:
- default: `rounded-[18px_14px_20px_12px] border-[2.5px] border-ink/20 bg-blush text-ink font-bold`
- hover (enabled, not selected): `hover:-translate-y-0.5 hover:border-ink hover:bg-paper hover:shadow-[4px_4px_0_var(--color-pink-soft)]`
- selected: `border-ink bg-pink-deep text-white shadow-[4px_4px_0_var(--color-ink)]`
- marker: replace the round letter badge with `<ShapeMarker index={i} selected={selected} />` (○ A, △ B, □ C, ☆ D; cycles for >4 options). Shape fill always white with ink outline; letter is ink, or pink-deep when selected. Keep `aria-pressed`.
**Input / textarea**:
```
rounded-[16px_12px_18px_12px] border-[2.5px] border-ink/20 bg-blush px-4 py-3 font-bold text-ink placeholder:text-ink/45 focus:border-pink-deep focus:bg-paper focus:shadow-[4px_4px_0_var(--color-pink-soft)] focus:outline-none
```
 
**Label "Twój nick"**: `text-lg font-extrabold text-pink-deep`, the word "nick" wrapped in `.hl` with `text-ink`.
 
**"Pytanie N"**: `font-display text-lg font-extrabold text-pink-deep`.
 
**Timer pill**:
- normal: `rounded-full border-[2.5px] border-ink bg-paper px-3 py-1 text-sm font-extrabold tabular-nums text-ink` + leading 10 px dot `bg-mint border-2 border-ink rounded-full`. Replace the clock SVG with this dot.
- urgent (<=5 s): `pulse-urgent bg-alert text-white shadow-[3px_3px_0_var(--color-ink)]`, dot becomes `bg-butter`.
**Progress row**: `<Sparkle />` 24 px instead of OrangeDot; track `h-3.5 rounded-full border-[2.5px] border-ink bg-paper overflow-hidden`; fill `bg-pink border-r-[2.5px] border-ink` (drop the right border at 100%); counter `text-sm font-extrabold tabular-nums text-ink`.
 
**Error alert** (QuizFlow): `rounded-[18px_14px_20px_12px] border-[2.5px] border-alert bg-paper px-4 py-3 text-sm font-bold text-ink shadow-[4px_4px_0_var(--color-pink-soft)]`.
 
**Thank-you**: H1 `font-display` 32–48 px, only the word "odpowiedzi" gets `.hl` (instead of every word wavy). Card gets a 52 px mint circle badge with an ink check icon centered on its top edge (`pop-in`).
 
## 5. Decorations (`components/decor.tsx`)
 
Replace exports. All decorative SVGs: `aria-hidden`, `pointer-events-none`. Stickers get `sticker-shadow` (drop-shadow follows the shape).
 
```tsx
const INK = "var(--color-ink)";
 
export function Sparkle({ className = "", fill = "var(--color-pink)" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path d="M12 1C13 8 16 11 23 12C16 13 13 16 12 23C11 16 8 13 1 12C8 11 11 8 12 1Z"
        fill={fill} stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}
 
export function Heart({ className = "", fill = "var(--color-butter)" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z"
        fill={fill} stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}
 
export function Star({ className = "", fill = "var(--color-lilac)" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path d="M12 2l2.9 6.3 6.9.7-5.2 4.6 1.5 6.8L12 17l-6.1 3.4 1.5-6.8L2.2 9l6.9-.7z"
        fill={fill} stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
 
export function Blob({ className = "", fill = "var(--color-mint)" }) {
  return (
    <svg viewBox="0 0 84 70" aria-hidden className={className}>
      <path d="M38 6c14-6 34 2 38 18s-4 34-20 40-38 2-46-12S24 12 38 6z" fill={fill} stroke={INK} strokeWidth="2.5" />
    </svg>
  );
}
 
export function Lightstick({ className = "", fill = "var(--color-pink)" }) {
  return (
    <svg viewBox="0 0 40 84" aria-hidden className={className}>
      <path d="M20 34s-15-9.5-15-20a8.5 8.5 0 0 1 15-5.3A8.5 8.5 0 0 1 35 14c0 10.5-15 20-15 20z"
        fill={fill} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <rect x="15" y="38" width="10" height="42" rx="5" fill="#fff" stroke={INK} strokeWidth="2.5" />
      <rect x="15" y="46" width="10" height="6" fill={INK} />
    </svg>
  );
}
 
/** Replaces SquigglyArrow and Connector. */
export function Ribbon({ className = "", color = "var(--color-pink)" }) {
  return (
    <svg viewBox="0 0 96 28" fill="none" aria-hidden className={className}>
      <path d="M2 14C12 2 22 26 32 14S52 2 62 14S82 26 92 14" stroke={color} strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}
 
/** Hangul sticker. text: 퀴즈 (quiz) · 시작! (start) · 화이팅! (you got this) · 정답? (answer?) · 끝! (the end) */
export function HangulSticker({ text, className = "", bg = "bg-butter" }: { text: string; className?: string; bg?: string }) {
  return (
    <span aria-hidden
      className={`pointer-events-none inline-block rounded-[14px_8px_16px_10px] border-[2.5px] border-ink px-3.5 py-1 font-hangul text-xl text-ink shadow-[3px_3px_0_var(--color-ink)] ${bg} ${className}`}>
      {text}
    </span>
  );
}
 
/** Washi tape on a card's top edge. Position + rotation via className. */
export function Tape({ className = "", color = "bg-butter/85" }) {
  return <span aria-hidden className={`pointer-events-none absolute h-6 w-20 border-x-2 border-dashed border-ink/25 ${color} ${className}`} />;
}
 
/** Answer marker: ○ △ □ ☆ with the letter inside. */
export function ShapeMarker({ index, selected }: { index: number; selected: boolean }) {
  const letter = String.fromCharCode(65 + index);
  const shape = index % 4;
  return (
    <span className="relative mt-0.5 flex h-[30px] w-[30px] shrink-0 items-center justify-center">
      <svg viewBox="0 0 28 28" aria-hidden className="absolute inset-0 h-full w-full">
        {shape === 0 && <circle cx="14" cy="14" r="11" fill="#fff" stroke={INK} strokeWidth="2.3" />}
        {shape === 1 && <path d="M14 3L26 24H2Z" fill="#fff" stroke={INK} strokeWidth="2.3" strokeLinejoin="round" />}
        {shape === 2 && <rect x="3.5" y="3.5" width="21" height="21" rx="2" fill="#fff" stroke={INK} strokeWidth="2.3" />}
        {shape === 3 && <path d="M14 2.5l3.4 7.2 7.9.9-5.9 5.3 1.7 7.8L14 19.8l-7.1 3.9 1.7-7.8-5.9-5.3 7.9-.9z" fill="#fff" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />}
      </svg>
      <span className={`relative text-[11px] font-extrabold ${shape === 1 ? "top-[3px]" : ""} ${selected ? "text-pink-deep" : "text-ink"}`}>{letter}</span>
    </span>
  );
}
 
/** Replaces Wavy. Keep the export name `Wavy` as an alias if you want fewer call-site edits. */
export function Highlight({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`hl ${className}`}>{children}</span>;
}
```
 
Old → new: `OrangeDot` → `Sparkle`, `Wavy` → `Highlight`, `SquigglyArrow` → `Ribbon` or a sticker, `Connector` → remove or a small `Ribbon`.
 
## 6. Sticker placement (max 4–5 per screen)
 
Stickers are `absolute` / `fixed` on the screen edges, under content in z-order, never behind the question, options or buttons. Rotation between -16° and 16°, every sticker a different angle. One large shape (Blob) max per screen, partly off-screen in a corner. Hide the bigger ones below 360 px width if they collide.
 
- **Start (JoinCard)**: `퀴즈` butter sticker top-left (-9°), pink Lightstick top-right (16°), mint Blob bottom-left half off-screen (-10°), lilac Star bottom-right (8°), small pink Sparkle on the H1's top-right corner. Butter Tape centered on the form's top edge (-5°).
- **Question (QuizCard)**: `정답?` mint sticker top-right (7°), butter Heart top-left (-12°), lilac Ribbon bottom-left (-4°). Butter Tape top-left of the card (-6°).
- **Question with <=5 s**: same component, only the timer state changes. (The reference shows `화이팅!` pink sticker, lilac Star and butter Blob, just as a variation. Picking one fixed set for QuizCard is fine.)
- **Thank-you**: `끝!` butter sticker top-right (10°), mint Lightstick top-left (-16°), pink Heart and lilac Sparkle near the bottom, pink Ribbon above the H1.
- **Results page**: same tokens. Confetti colors: pink, mint, butter, lilac, pink-deep. Champion cards: paper bg, ink outline, butter highlight on the crown row.
## 7. Accessibility checks
 
- White on `pink-deep` = 5.2:1. Do not put white text on `pink` (#ff4f9a) or `mint` (fails).
- Secondary text uses solid `ink-soft`, not ink with opacity.
- All decor is `aria-hidden` + `pointer-events-none`. Hangul is never the only carrier of meaning.
- Focus is visible (pink-deep border + pink-soft shadow). Do not remove focus styles without a replacement.
- All animations are off under `prefers-reduced-motion`.
## 8. Done when
 
- No Poppins, no #f7efdd / #ecdcba / #f2803e / wavy underline left in the codebase (`grep -rn "f7efdd\|ecdcba\|f2803e\|wavy\|Poppins"`).
- All 4 screens match the canvas artboards at 390 px width. Desktop stays the same centered `max-w-md` column.
- `pnpm lint` and `pnpm build` pass.
 
