import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string;
      remove: (widgetId?: string) => void;
      reset: (widgetId?: string) => void;
      getResponse: (widgetId?: string) => string;
    };
  }
}

const TURNSTILE_SITE_KEY = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY || "0x4AAAAAADcAui1yybCKOv5s";

export default function Turnstile({ onToken }: { onToken: (token: string | null) => void }) {
  const container = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | undefined>(undefined);

  useEffect(() => {
    let interval: number | undefined;

    const render = () => {
      if (!window.turnstile || !container.current || widgetId.current) return;
      widgetId.current = window.turnstile.render(container.current, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: (token: string) => onToken(token),
        "expired-callback": () => onToken(null),
        "error-callback": () => onToken(null),
      });
      if (interval) window.clearInterval(interval);
    };

    render();
    if (!widgetId.current) interval = window.setInterval(render, 200);

    return () => {
      if (interval) window.clearInterval(interval);
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
    };
  }, [onToken]);

  return <div ref={container} className="flex justify-center" />;
}
