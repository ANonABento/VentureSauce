const NUMBER = /(\$?\d[\d,.]*(?:[KMB]\b|%)?)/;

/** Sets the numbers in a sentence in mono and leaves the words alone. */
export function Figures({ text }: { text: string }) {
  return text.split(NUMBER).map((part, index) =>
    index % 2 === 1 ? (
      <span key={index} className="font-mono">
        {part}
      </span>
    ) : (
      part
    ),
  );
}
