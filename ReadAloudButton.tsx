import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface ExpandableSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const ExpandableSection = ({ title, children, defaultOpen = false }: ExpandableSectionProps) => {
  const [open, setOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(defaultOpen ? undefined : 0);

  useEffect(() => {
    if (open) {
      const el = contentRef.current;
      if (el) setHeight(el.scrollHeight);
    } else {
      setHeight(0);
    }
  }, [open]);

  return (
    <div className="border-b-2 border-border">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="flex w-full items-center justify-between py-5 text-left font-semibold text-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
        >
          <span>{title}</span>
          <ChevronDown
            size={20}
            aria-hidden="true"
            className={`ml-4 flex-shrink-0 text-muted-foreground transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          />
        </button>
      </h3>
      <div
        ref={contentRef}
        style={{ height: height !== undefined ? `${height}px` : "auto", overflow: "hidden" }}
        className="transition-[height] duration-300 ease-in-out"
        role="region"
        aria-label={title}
      >
        <div className="pb-6 text-foreground">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ExpandableSection;
