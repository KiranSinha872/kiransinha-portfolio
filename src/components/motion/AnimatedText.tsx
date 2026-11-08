'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';

interface CharacterProps {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
}

function Character({ children, progress, range }: CharacterProps) {
  const opacity = useTransform(progress, range, [0.2, 1]);
  return (
    <motion.span style={{ opacity }} className="inline">
      {children}
    </motion.span>
  );
}

interface WordProps {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
}

function Word({ children, progress, range }: WordProps) {
  const characters = children.split('');
  const amount = range[1] - range[0];
  const step = amount / characters.length;

  return (
    <span className="inline-block mr-[0.3em] whitespace-nowrap">
      {characters.map((char, i) => {
        const start = range[0] + i * step;
        const end = range[0] + (i + 1) * step;
        return (
          <Character key={i} progress={progress} range={[start, end]}>
            {char}
          </Character>
        );
      })}
    </span>
  );
}

export default function AnimatedText({
  text,
  className = '',
}: {
  text: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 0.8', 'end 0.2'],
  });

  const words = text.split(' ');
  const totalWords = words.length;

  return (
    <p ref={containerRef} className={className}>
      {words.map((word, i) => {
        const start = i / totalWords;
        const end = (i + 1) / totalWords;
        return (
          <Word key={i} progress={scrollYProgress} range={[start, end]}>
            {word}
          </Word>
        );
      })}
    </p>
  );
}
