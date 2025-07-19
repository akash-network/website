import { useEffect, useRef, useState } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
}

interface ParticleConfig {
  /** Number of particles to render */
  count?: number;
  /** Speed multiplier for particle movement */
  speed?: number;
  /** Size range for particles [min, max] */
  sizeRange?: [number, number];
  /** Opacity range for particles [min, max] */
  opacityRange?: [number, number];
  /** Distance at which particles connect with lines */
  connectionDistance?: number;
  /** Radius of mouse interaction effect */
  mouseInteractionRadius?: number;
  /** Whether particle animation is enabled */
  enabled?: boolean;
}

interface ParticlesBackgroundProps {
  config?: ParticleConfig;
}

const ParticlesBackground = ({ config = {} }: ParticlesBackgroundProps) => {
  const {
    count = 380,
    speed = 1,
    sizeRange = [1, 4],
    opacityRange = [0.2, 0.7],
    connectionDistance = 150,
    mouseInteractionRadius = 140,
    enabled = true,
  } = config;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !enabled) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    const createParticles = () => {
      const particleCount = Math.min(
        count,
        (canvas.width * canvas.height) / 800,
      );
      particlesRef.current = [];

      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 2 * speed,
          vy: (Math.random() - 0.5) * 2 * speed,
          size: Math.random() * (sizeRange[1] - sizeRange[0]) + sizeRange[0],
          opacity:
            Math.random() * (opacityRange[1] - opacityRange[0]) +
            opacityRange[0],
        });
      }
    };

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw particles
      particlesRef.current.forEach((particle) => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
        ctx.fill();
      });

      // Draw lines between nearby particles
      particlesRef.current.forEach((particle, i) => {
        particlesRef.current.slice(i + 1).forEach((otherParticle) => {
          const distance = Math.sqrt(
            Math.pow(particle.x - otherParticle.x, 2) +
              Math.pow(particle.y - otherParticle.y, 2),
          );

          if (distance < connectionDistance) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.4 * (1 - distance / connectionDistance)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      });
    };

    const updateParticles = () => {
      particlesRef.current.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.vx *= -1;
        }
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.vy *= -1;
        }

        // Keep particles within bounds
        particle.x = Math.max(0, Math.min(canvas.width, particle.x));
        particle.y = Math.max(0, Math.min(canvas.height, particle.y));
      });
    };

    const animate = () => {
      updateParticles();
      drawParticles();
      animationRef.current = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      resizeCanvas();
      createParticles();
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      particlesRef.current.forEach((particle) => {
        const distance = Math.sqrt(
          Math.pow(particle.x - mouseX, 2) + Math.pow(particle.y - mouseY, 2),
        );

        if (distance < mouseInteractionRadius) {
          const angle = Math.atan2(particle.y - mouseY, particle.x - mouseX);
          const force =
            (mouseInteractionRadius - distance) / mouseInteractionRadius;
          particle.vx += Math.cos(angle) * force * 0.5;
          particle.vy += Math.sin(angle) * force * 0.5;
        }
      });
    };

    resizeCanvas();
    createParticles();
    animate();

    window.addEventListener("resize", handleResize);
    canvas.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [
    count,
    speed,
    sizeRange,
    opacityRange,
    connectionDistance,
    mouseInteractionRadius,
    enabled,
  ]);

  if (!enabled) {
    return null;
  }

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />;
};

interface FuelProps {
  particleConfig?: ParticleConfig;
}

const Fuel = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  return (
    <section className="relative bg-primary">
      <ParticlesBackground
        config={
          {
            count: isMobile ? 40 : 100,
            speed: 1,
            sizeRange: [1, 4],
            opacityRange: [0.2, 0.7],
            connectionDistance: 150,
            mouseInteractionRadius: 140,
            enabled: true,
          } as ParticleConfig
        }
      />
      <div className="relative z-10 flex flex-col items-center justify-center py-12 md:py-20">
        <img src="/images/akashstar.svg" alt="Akash Star" className="h-12" />
        <div className="mt-5 flex flex-col gap-2">
          <h2 className="text-center text-[40px] font-semibold leading-[50px] md:text-5xl">
            <span className="font-instrument">AKT</span>:The Fuel{" "}
            <br className="md:hidden" /> Behind Akash
          </h2>
          <p className="px-6 text-center text-white">
            AKT is the utility token that powers every GPU transaction on the
            Akash decentralized cloud.
          </p>
        </div>
        <a
          href="/token/"
          className="mt-10 flex items-center gap-2 rounded bg-white px-6  py-3 text-black transition-all duration-300 hover:bg-[#E9E9E9]"
        >
          Learn How AKT Works
        </a>
      </div>
    </section>
  );
};

export default Fuel;
