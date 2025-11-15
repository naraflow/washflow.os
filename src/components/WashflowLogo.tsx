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
      {/* Soft blue rounded background */}
      <rect
        x="2"
        y="2"
        width="20"
        height="20"
        rx="5"
        fill="hsl(var(--primary))"
      />
      
      {/* Washing Machine Body - Light with shadow */}
      <rect
        x="6"
        y="6"
        width="12"
        height="14"
        rx="2"
        fill="white"
        opacity="0.95"
      />
      
      {/* Control dots - top left */}
      <circle cx="8" cy="8.5" r="0.4" fill="hsl(var(--primary))" opacity="0.6" />
      <circle cx="9.2" cy="8.5" r="0.4" fill="hsl(var(--primary))" opacity="0.6" />
      <circle cx="10.4" cy="8.5" r="0.4" fill="hsl(var(--primary))" opacity="0.6" />
      
      {/* Door outer ring */}
      <circle
        cx="12"
        cy="14"
        r="4.5"
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="0.8"
        opacity="0.3"
      />
      
      {/* Door middle ring */}
      <circle
        cx="12"
        cy="14"
        r="3.5"
        fill="hsl(var(--primary))"
        opacity="0.6"
      />
      
      {/* Door inner circle - darker */}
      <circle
        cx="12"
        cy="14"
        r="2.5"
        fill="hsl(var(--primary))"
        opacity="0.8"
      />
      
      {/* Highlight reflection */}
      <path
        d="M 13 12.5 A 2 2 0 0 1 14 14"
        stroke="white"
        strokeWidth="0.6"
        fill="none"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
};
