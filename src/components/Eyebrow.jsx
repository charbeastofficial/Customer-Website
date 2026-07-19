export default function Eyebrow({ children, className = "" }) {
  return (
    <span className={`block text-sm font-extrabold tracking-wide text-ink uppercase ${className}`}>
      {children}
    </span>
  );
}
