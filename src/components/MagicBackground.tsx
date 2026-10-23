'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speedX: number;
  speedY: number;
  color: string;
  delay: number;
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

export function MagicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);

  const colors = [
    'rgba(110, 231, 183, 0.6)',   // emerald
    'rgba(167, 139, 250, 0.5)',   // violet
    'rgba(251, 191, 36, 0.5)',    // amber
    'rgba(56, 189, 248, 0.4)',    // sky
    'rgba(244, 114, 182, 0.4)',   // pink
  ];

  const sparkleColors = [
    '#fde047', // amber-300
    '#f472b6', // pink-400
    '#a78bfa', // violet-400
    '#6ee7b7', // emerald-300
    '#ffffff',
  ];

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

  useEffect(() => {
    if (!canvasRef.current || width === 0 || height === 0) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Initialize particles
    const newParticles: Particle[] = Array.from({ length: 40 }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.4 + 0.1,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3 - 0.1,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * Math.PI * 2,
    }));

    const newSparkles: Sparkle[] = Array.from({ length: 15 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 4 + 2,
      opacity: 0,
      rotation: Math.random() * Math.PI * 2,
      scale: 0,
      color: sparkleColors[Math.floor(Math.random() * sparkleColors.length)],
    }));

    setParticles(newParticles);
    setSparkles(newSparkles);
  }, [width, height]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const animate = (timestamp: number) => {
      timeRef.current = timestamp / 1000;
      ctx.clearRect(0, 0, width, height);

      // Draw gradient background orbs
      const gradient1 = ctx.createRadialGradient(
        width * 0.2, height * 0.3, 0,
        width * 0.2, height * 0.3, width * 0.6
      );
      gradient1.addColorStop(0, 'rgba(110, 231, 183, 0.08)');
      gradient1.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient1;
      ctx.fillRect(0, 0, width, height);

      const gradient2 = ctx.createRadialGradient(
        width * 0.8, height * 0.7, 0,
        width * 0.8, height * 0.7, width * 0.5
      );
      gradient2.addColorStop(0, 'rgba(167, 139, 250, 0.06)');
      gradient2.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient2;
      ctx.fillRect(0, 0, width, height);

      const gradient3 = ctx.createRadialGradient(
        width * 0.5, height * 0.5, 0,
        width * 0.5, height * 0.5, width * 0.7
      );
      gradient3.addColorStop(0, 'rgba(251, 191, 36, 0.04)');
      gradient3.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient3;
      ctx.fillRect(0, 0, width, height);

      // Update and draw particles
      setParticles(prev => prev.map(p => {
        const t = timeRef.current + p.delay;
        const newX = p.x + Math.sin(t * 0.5) * 20 + p.speedX * 10;
        const newY = p.y + Math.cos(t * 0.3) * 15 + p.speedY * 10 - t * 5;
        
        // Wrap around
        let wrappedX = newX;
        let wrappedY = newY;
        if (wrappedX < -50) wrappedX = width + 50;
        if (wrappedX > width + 50) wrappedX = -50;
        if (wrappedY < -50) wrappedY = height + 50;
        if (wrappedY > height + 50) wrappedY = -50;

        // Draw particle
        ctx.beginPath();
        ctx.arc(wrappedX, wrappedY, p.size * window.devicePixelRatio, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
        ctx.globalAlpha = 1;

        return { ...p, x: wrappedX, y: wrappedY };
      }));

      // Update and draw sparkles
      setSparkles(prev => prev.map((s, i) => {
        const t = timeRef.current;
        const phase = (t * 0.5 + i * 0.7) % (Math.PI * 2);
        const newScale = Math.sin(phase) * 0.5 + 0.5;
        const newOpacity = Math.sin(phase) * 0.5 + 0.3;

        // Draw sparkle (cross shape)
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
      }));

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current!);
  }, [particles, sparkles, width, height]);

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
    { x: '10%', y: '15%', size: '300px', color: 'rgba(110, 231, 183, 0.08)', delay: 0 },
    { x: '85%', y: '20%', size: '200px', color: 'rgba(167, 139, 250, 0.06)', delay: 2 },
    { x: '15%', y: '75%', size: '250px', color: 'rgba(251, 191, 36, 0.05)', delay: 4 },
    { x: '75%', y: '80%', size: '180px', color: 'rgba(56, 189, 248, 0.05)', delay: 1 },
    { x: '50%', y: '50%', size: '400px', color: 'rgba(244, 114, 182, 0.03)', delay: 3 },
  ];

  return (
    <>
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-[150px] pointer-events-none"
          style={{
            left: orb.x,
            top: orb.y,
            width: orb.size,
            height: orb.size,
            backgroundColor: orb.color,
          }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{
            opacity: [0.5, 1, 0.5],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 20 + i * 3,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: orb.delay,
          }}
        />
      ))}
    </>
  );
}

export function FloatingSparkles() {
  const sparkles = Array.from({ length: 20 }, (_, i) => ({
    x: `${Math.random() * 90 + 5}%`,
    y: `${Math.random() * 90 + 5}%`,
    delay: Math.random() * 3,
    duration: 2 + Math.random() * 3,
    size: Math.random() * 4 + 2,
  }));

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
            scale: [0, 1, 0],
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
              background: `radial-gradient(circle, ${['#fde047', '#f472b6', '#a78bfa', '#6ee7b7'][i % 4]} 0%, transparent 70%)`,
              borderRadius: '50%',
              filter: 'blur(1px)',
            }}
          />
        </motion.div>
      ))}
    </>
  );
}