export default function Reveal({ children, className = "", delay = 0, as: Tag = "div" }) {
  const style = {
    opacity: 0,
    animation: `fadeSlideUp 0.55s ease-out ${delay}ms forwards`,
  };

  return (
    <Tag className={className} style={style}>
      {children}
    </Tag>
  );
}
