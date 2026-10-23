'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseSize: number;
  opacity: number;
  baseOpacity: number;
  speedX: number;
  speedY: number;
  color: string;
  delay: number;
  hue: number;
  connections: number[];
}

interface Sparkle {
  x: number;
  y: number;
  size: number;
  opacity: number;
  rotation: number;
  scale: number;
  color: string;
}

interface SparkleConfig {
  x: string;
  y: string;
  delay: number;
  duration: number;
  size: number;
}

const PARTICLE_COUNT = 50;
const SPARKLE_COUNT = 15;
const CONNECTION_DISTANCE = 180;
const MOUSE_INFLUENCE_RADIUS = 200;

const PARTICLE_COLORS = [
  [110, 231, 183],   // emerald
  [167, 139, 250],   // violet
  [251, 191, 36],    // amber
  [56, 189, 248],    // sky
  [244, 114, 182],   // pink
];

const SPARKLE_COLORS = [
  '#fde047',
  '#f472b6',
  '#a78bfa',
  '#6ee7b7',
  '#ffffff',
];

function createParticle(width: number, height: number) {
  const colorIndex = Math.floor(Math.random() * 5);
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4 - 0.05,
    size: Math.random() * 3 + 1.5,
    baseSize: Math.random() * 3 + 1.5,
    opacity: Math.random() * 0.4 + 0.15,
    baseOpacity: Math.random() * 0.4 + 0.15,
    speedX: (Math.random() - 0.5) * 0.3,
    speedY: (Math.random() - 0.5) * 0.3 - 0.1,
    color: colorIndex,
    delay: Math.random() * Math.PI * 2,
    hue: Math.random() * 60,
    connections: [],
  };
}

function createSparkle(width: number, height: number) {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * 4 + 2,
    opacity: 0,
    rotation: Math.random() * Math.PI * 2,
    scale: 0,
    color: Math.floor(Math.random() * 5),
  };
}

export function MagicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const animationRef = useRef<number | null>(null);
  const timeRef = useRef(0);
  const particlesRef = useRef<Array<Particle>>([]);
  const sparklesRef = useRef<Sparkle[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });
  const gradientTimeRef = useRef(0);

  // Handle mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY, active: true };
    };
    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Initialize particles when width/height are available
  useEffect(() => {
    if (!canvasRef.current || width === 0 || height === 0) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Initialize particles with velocity and color
    const newParticles = Array.from({ length: 50 }, (_, i) => {
      const p = createParticle(width, height);
      // Add slight initial velocity variation
      p.vx = (Math.random() - 0.5) * 0.5;
      p.vy = (Math.random() - 0.5) * 0.5 - 0.1;
      return p;
    });

    // Initialize sparkles
    const newSparkles = Array.from({ length: 15 }, () => createSparkle(width, height));

    particlesRef.current = Array.from({ length: 50 }, () => {
      const p = createParticle(width, height);
      p.vx = (Math.random() - 0.5) * 0.5;
      p.vy = (Math.random() - 0.5) * 0.5 - 0.1;
      return p;
    });

    const newSparkles = Array.from({ length: 15 }, () => createSparkle(width, height));
    // We'll handle refs directly without state
  }, [width, height]);

  // Handle resize
  useEffect(() => {
    const resize = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.parentElement?.getBoundingClientRect();
        if (rect) {
          setWidth(rect.width);
          setHeight(rect.height);
          canvasRef.current.width = rect.width * window.devicePixelRatio;
          canvasRef.current.height = rect.height * window.devicePixelRatio;
        }
      }
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // Animation loop
  useEffect(() => {
    if (!canvasRef.current || width === 0 || height === 0) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Initialize particles once
    if (particlesRef.current.length === 0) {
      particlesRef.current = Array.from({ length: 50 }, () => {
        const p = createParticle(width, height);
        p.vx = (Math.random() - 0.5) * 0.5;
        p.vy = (Math.random() - 0.5) * 0.5 - 0.1;
        return p;
      });
      const newSparkles = Array.from({ length: 15 }, () => createSparkle(width, height));
      // Initialize sparkles ref
      // We'll just use refs directly
    }

    const ctx = canvasRef.current.getContext('2d')!;
    let gradientTime = 0;

    const animate = (timestamp: number) => {
      const t = timestamp / 1000;
      timeRef.current = t;
      gradientTimeRef.current += 0.001;
      const ctx = canvasRef.current!.getContext('2d')!;
      ctx.clearRect(0, 0, width, height);

      // Animated gradient background
      const gt = gradientTimeRef.current * 0.5;
      const gradient1 = ctx.createRadialGradient(
        width * (0.2 + Math.sin(gt * 0.3) * 0.1), 
        height * (0.3 + Math.cos(gt * 0.2) * 0.1), 0,
        width * 0.2, height * 0.3, width * 0.6
      );
      gradient1.addColorStop(0, 'rgba(110, 231, 183, 0.1)');
      gradient1.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient1;
      ctx.fillRect(0, 0, width, height);

      const gradient2 = ctx.createRadialGradient(
        width * (0.8 + Math.cos(gt * 0.25) * 0.1), 
        height * (0.7 + Math.sin(gt * 0.35) * 0.1), 0,
        width * 0.8, height * 0.7, width * 0.5
      );
      gradient2.addColorStop(0, 'rgba(167, 139, 250, 0.08)');
      gradient2.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient2;
      ctx.fillRect(0, 0, width, height);

      const gradient3 = ctx.createRadialGradient(
        width * (0.5 + Math.sin(gt * 0.4) * 0.15), 
        height * (0.5 + Math.cos(gt * 0.45) * 0.15), 0,
        width * 0.5, height * 0.5, width * 0.7
      );
      gradient3.addColorStop(0, 'rgba(251, 191, 36, 0.05)');
      gradient3.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient3;
      ctx.fillRect(0, 0, width, height);

      // Update particles
      const mouse = mouseRef.current;
      const particles = particlesRef.current;
      
      // Update and draw connections first (behind particles)
      if (particles.length > 0) {
        ctx.lineWidth = 0.5;
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[j].x - particles[i].x;
            const dy = particles[j].y - particles[i].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < CONNECTION_DISTANCE) {
              const opacity = (1 - dist / CONNECTION_DISTANCE) * 0.15;
              const [r1, g1, b1] = PARTICLE_COLORS[particles[i].color];
              const [r2, g2, b2] = PARTICLE_COLORS[particles[j].color];
              const r = Math.round((r1 + r2) / 2);
              const g = Math.round((g1 + g2) / 2);
              const b = Math.round((b1 + b2) / 2);
              ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
              ctx.lineWidth = 0.5;
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }
      }

      // Update and draw particles
      if (particlesRef.current.length > 0) {
        particlesRef.current.forEach((p, i) => {
          const t = timeRef.current + p.delay;
          
          // Mouse influence
          if (mouseRef.current.active) {
            const dx = mouseRef.current.x - p.x;
            const dy = mouseRef.current.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < MOUSE_INFLUENCE_RADIUS && dist > 0) {
              const force = (1 - dist / MOUSE_INFLUENCE_RADIUS) * 0.5;
              p.vx += (dx / dist) * force * 0.1;
              p.vy += (dy / dist) * force * 0.1;
            }
          }

          // Base movement
          p.x += p.vx + Math.sin(t * 0.3 + p.delay) * 0.5;
          p.y += p.vy + Math.cos(t * 0.4 + p.delay) * 0.5 - 0.1;

          // Wrap around
          if (p.x < -50) p.x = width + 50;
          if (p.x > width + 50) p.x = -50;
          if (p.y < -50) p.y = height + 50;
          if (p.y > height + 50) p.y = -50;

          // Damping
          p.vx *= 0.995;
          p.vy *= 0.995;

          // Pulsing size
          const pulseScale = 1 + Math.sin(t * 1.5 + p.delay * 2) * 0.3;
          const currentSize = p.baseSize * pulseScale;

          // Pulsing opacity
          const pulseOpacity = p.baseOpacity * (0.7 + Math.sin(t * 2 + p.delay * 3) * 0.3);

          // Color shift over time
          const hueShift = Math.sin(timeRef.current * 0.1 + p.hue) * 15;
          const colorIndex = p.color;
          const [r, g, b] = PARTICLE_COLORS[colorIndex];

          // Draw particle with glow
          const ctx = canvasRef.current!.getContext('2d')!;
          const radius = p.size * window.devicePixelRatio;
          
          // Glow effect
          const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius * 3);
          gradient.addColorStop(0, `rgba(${PARTICLE_COLORS[colorIndex].join(',')}, ${pulsingOpacity})`);
          gradient.addColorStop(1, 'transparent');
          
          ctx.beginPath();
          ctx.arc(p.x, p.y, radius * 3, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();

          // Core particle
          ctx.beginPath();
          ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${PARTICLE_COLORS[colorIndex].join(',')}, ${pulsingOpacity})`;
          ctx.fill();
        });
      }

      // Draw sparkles
      sparklesRef.current = sparklesRef.current.map((s, i) => {
        const t = timeRef.current;
        const phase = (t * 0.5 + i * 0.7) % (Math.PI * 2);
        const newScale = Math.sin(phase) * 0.5 + 0.5;
        const newOpacity = Math.sin(phase) * 0.5 + 0.3;

        const ctx = canvasRef.current!.getContext('2d')!;
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.rotation + t * 0.2);
        ctx.scale(newScale, newScale);
        ctx.globalAlpha = newOpacity;
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-s.size, 0);
        ctx.lineTo(s.size, 0);
        ctx.moveTo(0, -s.size);
        ctx.lineTo(0, s.size);
        ctx.stroke();
        ctx.restore();

        return { ...s, scale: newScale, opacity: newOpacity };
      });

      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current!);
  }, [width, height]);

  // Set canvas dimensions
  useEffect(() => {
    const resize = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.parentElement?.getBoundingClientRect();
        if (rect) {
          setWidth(rect.width);
          setHeight(rect.height);
          canvasRef.current.width = rect.width * window.devicePixelRatio;
          canvasRef.current.height = rect.height * window.devicePixelRatio;
        }
      }
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
      style={{ pointerEvents: 'none' }}
    />
  );
}

export function FloatingOrbs() {
  const orbs = [
    { x: '10%', y: '15%', size: '350px', color: 'rgba(110, 231, 183, 0.1)', delay: 0, speed: 25 },
    { x: '85%', y: '20%', size: '250px', color: 'rgba(167, 139, 250, 0.08)', delay: 2, speed: 30 },
    { x: '15%', y: '75%', size: '300px', color: 'rgba(251, 191, 36, 0.06)', delay: 4, speed: 28 },
    { x: '75%', y: '80%', size: '220px', color: 'rgba(56, 189, 248, 0.06)', delay: 1, speed: 32 },
    { x: '50%', y: '50%', size: '450px', color: 'rgba(244, 114, 182, 0.04)', delay: 3, speed: 35 },
    { x: '5%', y: '50%', size: '200px', color: 'rgba(244, 114, 182, 0.05)', delay: 5, speed: 22 },
  ];

  return (
    <>
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-[200px] pointer-events-none"
          style={{
            left: orb.x,
            top: orb.y,
            width: orb.size,
            height: orb.size,
            backgroundColor: orb.color,
          }}
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{
            opacity: [0.3, 0.8, 0.3],
            scale: [0.7, 1.3, 0.7],
            borderRadius: ['30% 70% 70% 30% / 30% 30% 70% 70%', '70% 30% 30% 70% / 70% 70% 30% 30%', '30% 70% 70% 30% / 30% 30% 70% 70%'],
          }}
          transition={{
            duration: orb.speed,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: orb.delay,
          }}
        />
      ))}
    </>
  );
}

interface SparkleConfig {
  x: string;
  y: string;
  delay: number;
  duration: number;
  size: number;
}

export function FloatingSparkles() {
  const [sparkles, setSparkles] = useState<SparkleConfig[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const newSparkles: SparkleConfig[] = Array.from({ length: 30 }, (_, i) => ({
      x: `${Math.random() * 90 + 5}%`,
      y: `${Math.random() * 90 + 5}%`,
      delay: Math.random() * 4,
      duration: 2.5 + Math.random() * 4,
      size: Math.random() * 5 + 2,
    }));
    setSparkles(newSparkles);
  }, []);

  if (!mounted) {
    return null;
  }

  const sparkleColors = ['#fde047', '#f472b6', '#a78bfa', '#6ee7b7', '#ffffff'];

  return (
    <>
      {sparkles.map((s, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none"
          style={{
            left: s.x,
            top: s.y,
            width: `${s.size}px`,
            height: `${s.size}px`,
          }}
          initial={{ opacity: 0, scale: 0, rotate: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: s.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: s.delay,
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle, ${sparkleColors[i % 5]} 0%, transparent 70%)`,
              borderRadius: '50%',
              filter: 'blur(1px)',
            }}
          />
        </motion.div>
      ))}
    </>
  );
}

// Add dynamic text animations to Hero
export function SparkleText({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <span className={className} style={{ opacity: 0 }}>{children}</span>;
  }

  return (
    <motion.span
      className={className}
      initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 1, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.span>
  );
}

export function GradientText({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <span className={className} style={{ opacity: 0 }}>{children}</span>;
  }

  return (
    <motion.span
      className={`${className} bg-gradient-to-r from-emerald-300 via-cyan-300 to-amber-300 bg-clip-text text-transparent`}
      initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 1.2, delay, ease: 'easeOut' }}
      style={{ backgroundSize: '200% 200%' }}
      animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
      transition={{ backgroundPosition: { duration: 8, repeat: Infinity, ease: 'linear' } }}
    >
      {children}
    </motion.span>
  );
}

export function FloatIn({ children, className = '', delay = 0, direction = 'up' }: { children: React.ReactNode; className?: string; delay?: number; direction?: 'up' | 'down' | 'left' | 'right' }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const directions = {
    up: { y: 30, x: 0 },
    down: { y: -30, x: 0 },
    left: { x: -30, y: 0 },
    right: { x: 30, y: 0 },
  };

  if (!mounted) {
    return <span className={className} style={{ opacity: 0 }}>{children}</span>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...directions[direction], filter: 'blur(8px)' }}
      animate={{ opacity: 1, x: 0, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 1, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerContainer({ children, className = '', delay = 0, stagger = 0.15 }: { children: React.ReactNode; className?: string; delay?: number; stagger?: number }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: stagger,
            delayChildren: delay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 20, filter: 'blur(10px)' },
        visible: {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          transition: { duration: 0.8, ease: 'easeOut' },
        },
      }}
    >
      {children}
    </motion.div>
  );
}