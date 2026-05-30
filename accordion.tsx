import { ReactNode } from "react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

interface RevealSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

const RevealSection = ({ children, className = "", delay = 0 }: RevealSectionProps) => {
  const { ref, visible } = useScrollReveal(0.1);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

export default RevealSection;
