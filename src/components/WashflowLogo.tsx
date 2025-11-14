import { cn } from "@/lib/utils";

interface WashflowLogoProps {
  className?: string;
  size?: number;
}

export const WashflowLogo = ({ className, size = 24 }: WashflowLogoProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className)}
    >
      {/* Blue rounded square background */}
      <rect
        x="2"
        y="2"
        width="20"
        height="20"
        rx="4"
        fill="hsl(var(--primary))"
      />
      
      {/* Washing Machine Body - White */}
      <rect
        x="5"
        y="8"
        width="14"
        height="12"
        rx="1"
        fill="white"
      />
      
      {/* Control Panel - Top section */}
      <rect
        x="5"
        y="5"
        width="14"
        height="3"
        rx="0.5"
        fill="white"
      />
      
      {/* Detergent dispenser drawer */}
      <rect
        x="6"
        y="5.5"
        width="2"
        height="2"
        rx="0.2"
        fill="hsl(var(--primary))"
      />
      
      {/* Vertical separator */}
      <line
        x1="9"
        y1="5.5"
        x2="9"
        y2="8"
        stroke="hsl(var(--primary))"
        strokeWidth="0.5"
      />
      
      {/* Control dial */}
      <circle
        cx="12"
        cy="6.5"
        r="0.8"
        fill="hsl(var(--primary))"
      />
      
      {/* Display/Button */}
      <rect
        x="14"
        y="5.8"
        width="3"
        height="1.4"
        rx="0.2"
        fill="hsl(var(--primary))"
      />
      
      {/* Main door - outer white circle */}
      <circle
        cx="12"
        cy="14"
        r="4"
        fill="none"
        stroke="white"
        strokeWidth="1.5"
      />
      
      {/* Inner blue circle (glass/drum) */}
      <circle
        cx="12"
        cy="14"
        r="2.8"
        fill="hsl(var(--primary))"
      />
      
      {/* Reflection/handle - crescent shape */}
      <path
        d="M 13.5 14 A 2.5 2.5 0 0 1 13.5 12.5"
        stroke="white"
        strokeWidth="0.8"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
};

