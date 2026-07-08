import { useEffect, useState } from "react";

// Delay showing spinner to avoid flashing on fast responses
const SPINNER_VISIBILITY_DELAY_MS = 300;

// Spinner sizing (32px = 8 Tailwind units)
const SPINNER_SIZE = "size-8";

type Props = {
  text?: string;
};

export function LoadingSpinner({ text = "Fetching context details..." }: Props) {
  const [isVisible, setIsVisible] = useState(false);

  // Delay visibility to avoid flash on fast responses
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), SPINNER_VISIBILITY_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      {/* Animated spinner */}
      <div className={`relative ${SPINNER_SIZE}`}>
        <div className="absolute inset-0 border-2 border-transparent border-t-primary border-r-primary rounded-full animate-spin" />
      </div>

      {/* Loading text */}
      {text && <p className="text-sm text-text-muted">{text}</p>}
    </div>
  );
}
