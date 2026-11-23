import type { ReactNode } from "react";

/*
 * Seoul Pop decorations. Everything here is purely decorative: aria-hidden and
 * pointer-events-none. Callers position + rotate via className. Stickers carry
 * a hard ink drop-shadow (.sticker-shadow) that follows the shape.
 */

const INK = "var(--color-ink)";

type DecorProps = { className?: string; fill?: string };

export function Sparkle({ className = "", fill = "var(--color-pink)" }: DecorProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={`pointer-events-none ${className}`}>
      <path
        d="M12 1C13 8 16 11 23 12C16 13 13 16 12 23C11 16 8 13 1 12C8 11 11 8 12 1Z"
        fill={fill}
        stroke={INK}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Heart({ className = "", fill = "var(--color-butter)" }: DecorProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={`sticker-shadow pointer-events-none ${className}`}
    >
      <path
        d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z"
        fill={fill}
        stroke={INK}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Star({ className = "", fill = "var(--color-lilac)" }: DecorProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={`sticker-shadow pointer-events-none ${className}`}
    >
      <path
        d="M12 2l2.9 6.3 6.9.7-5.2 4.6 1.5 6.8L12 17l-6.1 3.4 1.5-6.8L2.2 9l6.9-.7z"
        fill={fill}
        stroke={INK}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Blob({ className = "", fill = "var(--color-mint)" }: DecorProps) {
  return (
    <svg
      viewBox="0 0 84 70"
      aria-hidden
      className={`sticker-shadow pointer-events-none ${className}`}
    >
      <path
        d="M38 6c14-6 34 2 38 18s-4 34-20 40-38 2-46-12S24 12 38 6z"
        fill={fill}
        stroke={INK}
        strokeWidth="2.5"
      />
    </svg>
  );
}

export function Lightstick({ className = "", fill = "var(--color-pink)" }: DecorProps) {
  return (
    <svg
      viewBox="0 0 40 84"
      aria-hidden
      className={`sticker-shadow pointer-events-none ${className}`}
    >
      <path
        d="M20 34s-15-9.5-15-20a8.5 8.5 0 0 1 15-5.3A8.5 8.5 0 0 1 35 14c0 10.5-15 20-15 20z"
        fill={fill}
        stroke={INK}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <rect x="15" y="38" width="10" height="42" rx="5" fill="#fff" stroke={INK} strokeWidth="2.5" />
      <rect x="15" y="46" width="10" height="6" fill={INK} />
    </svg>
  );
}

/** Ribbon stroke, a flowing line accent. */
export function Ribbon({
  className = "",
  color = "var(--color-pink)",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg
      viewBox="0 0 96 28"
      fill="none"
      aria-hidden
      className={`pointer-events-none ${className}`}
    >
      <path
        d="M2 14C12 2 22 26 32 14S52 2 62 14S82 26 92 14"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Hangul sticker. text: 퀴즈 (quiz) · 시작! (start) · 화이팅! (you got this) · 정답? (answer?) · 끝! (the end) */
export function HangulSticker({
  text,
  className = "",
  bg = "bg-butter",
}: {
  text: string;
  className?: string;
  bg?: string;
}) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none inline-block rounded-[14px_8px_16px_10px] border-[2.5px] border-ink px-3.5 py-1 font-hangul text-xl text-ink shadow-[3px_3px_0_var(--color-ink)] ${bg} ${className}`}
    >
      {text}
    </span>
  );
}

/** Washi tape on a card's top edge. Position + rotation via className. */
export function Tape({
  className = "",
  color = "bg-butter/85",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute h-6 w-20 border-x-2 border-dashed border-ink/25 ${color} ${className}`}
    />
  );
}

/** Answer marker: ○ △ □ ☆ with the letter inside (cycles for >4 options). */
export function ShapeMarker({ index, selected }: { index: number; selected: boolean }) {
  const letter = String.fromCharCode(65 + index);
  const shape = index % 4;
  return (
    <span className="relative mt-0.5 flex h-[30px] w-[30px] shrink-0 items-center justify-center">
      <svg viewBox="0 0 28 28" aria-hidden className="absolute inset-0 h-full w-full">
        {shape === 0 && <circle cx="14" cy="14" r="11" fill="#fff" stroke={INK} strokeWidth="2.3" />}
        {shape === 1 && (
          <path d="M14 3L26 24H2Z" fill="#fff" stroke={INK} strokeWidth="2.3" strokeLinejoin="round" />
        )}
        {shape === 2 && (
          <rect x="3.5" y="3.5" width="21" height="21" rx="2" fill="#fff" stroke={INK} strokeWidth="2.3" />
        )}
        {shape === 3 && (
          <path
            d="M14 2.5l3.4 7.2 7.9.9-5.9 5.3 1.7 7.8L14 19.8l-7.1 3.9 1.7-7.8-5.9-5.3 7.9-.9z"
            fill="#fff"
            stroke={INK}
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
        )}
      </svg>
      <span
        className={`relative text-[11px] font-extrabold ${shape === 1 ? "top-[3px]" : ""} ${
          selected ? "text-pink-deep" : "text-ink"
        }`}
      >
        {letter}
      </span>
    </span>
  );
}

/** Yellow highlighter stripe behind a word (see .hl in globals.css). */
export function Highlight({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`hl ${className}`}>{children}</span>;
}
