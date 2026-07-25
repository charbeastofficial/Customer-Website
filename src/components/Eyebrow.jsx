export default function Eyebrow({ children, className = "", center = false }) {
  const inner = (
    <span className={`inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-brand uppercase ${className}`}>
      <span className="h-px w-6 bg-brand/30" />
      {children}
      <span className="h-px w-6 bg-brand/30" />
    </span>
  );
  if (center) return <div className="flex justify-center">{inner}</div>;
  return inner;
}
