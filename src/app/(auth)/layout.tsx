import "../globals.css";
export { generateMetadata } from "@/app/layout";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 bg-background overflow-hidden">
      {/* Precision Blueprint Grid SVG Pattern */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <svg
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="auth-grid-pattern"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              {/* Fine hairline grid lines */}
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="rgba(255, 255, 255, 0.07)"
                strokeWidth="1"
              />
              {/* Tactile intersection crosshairs (+) */}
              <path
                d="M -3.5 0 L 3.5 0 M 0 -3.5 L 0 3.5"
                fill="none"
                stroke="rgba(255, 255, 255, 0.3)"
                strokeWidth="1.2"
              />
            </pattern>
          </defs>

          <rect width="100%" height="100%" fill="url(#auth-grid-pattern)" />
        </svg>

        {/* Soft radial vignette so pattern fades gracefully toward edges */}
        <div
          className="absolute inset-0  bg-radial from-transparent via-90% via-background to-background pointer-events-none"
          aria-hidden="true"
        />
      </div>

      {/* Subtle Top-Right Ambient Glow matching Hero & Studio */}
      <div
        className="pointer-events-none absolute -top-40 right-1/4 z-0 h-96 w-96 rounded-full bg-accent/5 blur-[130px]"
        aria-hidden="true"
      />

      {/* Page Content */}
      <div className="relative z-10 w-full flex items-center justify-center">
        {children}
      </div>
    </main>
  );
}
