interface WordCardProps {
  chinese: string;
  phonetic?: string;
  target: string;
  input: string;
  cursor: number;
  errorIndices: Set<number>;
}

export function WordCard({ chinese, phonetic, target, input, cursor, errorIndices }: WordCardProps) {
  return (
    <div className="space-y-4 text-center">
      <div className="rounded-xl bg-indigo-50 px-6 py-8 dark:bg-indigo-950">
        <p className="text-3xl font-bold text-indigo-900 dark:text-indigo-100">{chinese}</p>
        {phonetic && (
          <p className="mt-2 text-sm text-indigo-500 dark:text-indigo-400">{phonetic}</p>
        )}
      </div>

      <div className="font-mono text-2xl tracking-wide">
        {target.split("").map((ch, i) => {
          let cls = "transition-colors ";
          if (i < input.length) {
            cls += errorIndices.has(i)
              ? "text-red-500 line-through"
              : "text-green-600 dark:text-green-400";
          } else if (i === cursor) {
            cls += "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400 animate-pulse";
          } else {
            cls += "text-gray-400 dark:text-gray-600";
          }
          return (
            <span key={i} className={cls}>{ch}</span>
          );
        })}
      </div>

      <div className="font-mono text-xl text-gray-300 dark:text-gray-700">
        {input}
        <span className="inline-block w-0.5 h-5 bg-blue-500 align-middle animate-pulse ml-0.5" />
      </div>
    </div>
  );
}