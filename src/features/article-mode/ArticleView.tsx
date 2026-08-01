import { useState } from "react";

interface ArticleViewProps {
  paragraph: string;
  translation?: string;
  input: string;
  cursor: number;
  errorIndices: Set<number>;
  paragraphIndex: number;
  totalParagraphs: number;
  composing: boolean;
}

export function ArticleView({
  paragraph,
  translation,
  input,
  cursor,
  errorIndices,
  paragraphIndex,
  totalParagraphs,
  composing,
}: ArticleViewProps) {
  const [showTranslation, setShowTranslation] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <span>Paragraph {paragraphIndex + 1} / {totalParagraphs}</span>
        {translation && (
          <button
            onClick={() => setShowTranslation(!showTranslation)}
            className="text-indigo-500 hover:underline text-xs"
          >
            {showTranslation ? "Hide" : "Show"} Translation
          </button>
        )}
      </div>

      {showTranslation && translation && (
        <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">
          {translation}
        </div>
      )}

      <div className="rounded-xl bg-white p-6 font-mono text-xl leading-relaxed tracking-wide shadow-sm dark:bg-gray-900">
        {paragraph.split("").map((ch, i) => {
          let cls = "transition-colors ";
          if (i < input.length) {
            cls += errorIndices.has(i)
              ? "text-red-500 bg-red-100 dark:bg-red-950 line-through"
              : "text-green-600 dark:text-green-400";
          } else if (i === cursor && !composing) {
            cls += "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950";
          } else {
            cls += "text-gray-700 dark:text-gray-300";
          }
          if (ch === "\n") {
            return <br key={i} />;
          }
          return (
            <span key={i} className={cls}>
              {ch}
            </span>
          );
        })}
      </div>

      <div className="font-mono text-lg text-gray-500 dark:text-gray-400 min-h-[2rem]">
        {composing ? (
          <span className="text-blue-500 animate-pulse">Composing...</span>
        ) : (
          <>
            {input}
            <span className="inline-block w-0.5 h-5 bg-blue-500 align-middle animate-pulse ml-0.5" />
          </>
        )}
      </div>
    </div>
  );
}