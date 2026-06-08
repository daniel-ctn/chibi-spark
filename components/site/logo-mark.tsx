import { cn } from "@/lib/utils";

interface LogoMarkProps {
  className?: string;
  title?: string;
}

export function LogoMark({ className, title = "ChibiDrop" }: LogoMarkProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      role="img"
      aria-label={title}
      className={cn("shrink-0", className)}
    >
      <rect width="64" height="64" rx="16" fill="#E8576F" />
      <circle cx="32" cy="34" r="20" fill="#FFF5EB" />
      <circle cx="25" cy="31" r="2.8" fill="#3D2E28" />
      <circle cx="39" cy="31" r="2.8" fill="#3D2E28" />
      <ellipse cx="20" cy="35" rx="3.5" ry="2.2" fill="#F5A0A8" opacity="0.55" />
      <ellipse cx="44" cy="35" rx="3.5" ry="2.2" fill="#F5A0A8" opacity="0.55" />
      <path
        d="M25 37.5Q32 42.5 39 37.5"
        stroke="#3D2E28"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M47 12.5 48.2 16.3 52 17.5 48.2 18.7 47 22.5 45.8 18.7 42 17.5 45.8 16.3Z"
        fill="#9FD9C4"
      />
    </svg>
  );
}
