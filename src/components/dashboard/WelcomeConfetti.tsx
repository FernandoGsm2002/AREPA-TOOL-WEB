import { useEffect, useState } from "react";

const particles = Array.from({ length: 30 }, (_, index) => ({
  id: index,
  left: 5 + ((index * 37) % 90),
  delay: (index % 8) * 55,
  duration: 1150 + ((index * 71) % 650),
  drift: -80 + ((index * 29) % 160),
  color: ["#a855f7", "#f59e0b", "#2dd4bf", "#f472b6"][index % 4],
  rotation: (index * 47) % 360,
}));

export default function WelcomeConfetti({ username }: { username: string }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), 2600);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 overflow-hidden" aria-hidden="true">
      <div className="welcome-confetti-message mx-auto mt-6 w-fit rounded-full border border-primary/30 bg-card/95 px-4 py-2 text-sm font-medium shadow-xl shadow-primary/15 backdrop-blur">
        ¡Bienvenido, {username}!
      </div>
      {particles.map((particle) => (
        <span
          key={particle.id}
          className="welcome-confetti-piece"
          style={{
            left: `${particle.left}%`,
            backgroundColor: particle.color,
            animationDelay: `${particle.delay}ms`,
            animationDuration: `${particle.duration}ms`,
            transform: `rotate(${particle.rotation}deg)`,
            ["--confetti-drift" as string]: `${particle.drift}px`,
          }}
        />
      ))}
      <style>{`
        .welcome-confetti-piece {
          position: absolute;
          top: 0;
          width: 9px;
          height: 15px;
          border-radius: 2px;
          opacity: 0;
          animation-name: welcome-confetti-fall;
          animation-timing-function: cubic-bezier(.2,.72,.35,1);
          animation-fill-mode: forwards;
        }
        .welcome-confetti-message {
          animation: welcome-confetti-message 2.35s ease-out both;
        }
        @keyframes welcome-confetti-fall {
          0% { opacity: 0; translate: 0 -28px; }
          10% { opacity: 1; }
          100% { opacity: 0; translate: var(--confetti-drift) 330px; rotate: 480deg; }
        }
        @keyframes welcome-confetti-message {
          0%, 12% { opacity: 0; transform: translateY(-10px) scale(.96); }
          25%, 72% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-8px) scale(.98); }
        }
        @media (prefers-reduced-motion: reduce) {
          .welcome-confetti-piece { display: none; }
          .welcome-confetti-message { animation: none; }
        }
      `}</style>
    </div>
  );
}
