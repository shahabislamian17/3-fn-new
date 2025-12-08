export function Logo({ className }: { className?: string }) {
  return (
    <div className={className}>
      <svg
        width="150"
        height="40"
        viewBox="0 0 150 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-auto"
      >
        <rect
          width="40"
          height="40"
          rx="8"
          className="fill-primary"
        />
        <path
          d="M13.6364 25.4545C13.6364 24.1187 14.7171 23.038 16.0529 23.038H23.9471C25.2829 23.038 26.3636 24.1187 26.3636 25.4545C26.3636 26.7904 25.2829 27.8711 23.9471 27.8711H16.0529C14.7171 27.8711 13.6364 26.7904 13.6364 25.4545Z"
          className="fill-card-foreground"
        />
        <path
          d="M20 12L20 23.871M20 12L24 16.4M20 12L16 16.4"
          className="stroke-card-foreground"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <text
          x="50"
          y="18"
          fontFamily="'PT Sans', sans-serif"
          fontSize="18"
          fontWeight="bold"
          className="fill-foreground"
        >
          3JN
        </text>
        <text
          x="50"
          y="36"
          fontFamily="'PT Sans', sans-serif"
          fontSize="18"
          fontWeight="bold"
          className="fill-foreground"
        >
          FUND
        </text>
      </svg>
    </div>
  );
}
