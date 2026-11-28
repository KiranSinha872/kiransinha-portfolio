import React from 'react';

export interface SectionHeadingProps {
  label?: string;
  title?: string;
  description?: string;
  align?: 'left' | 'center';
  className?: string;
  children?: React.ReactNode;
}

export default function SectionHeading({
  label,
  title,
  description,
  align = 'left',
  className = '',
  children,
}: SectionHeadingProps) {
  const isCenter = align === 'center';

  return (
    <div
      className={`space-y-3 ${
        isCenter ? 'text-center mx-auto items-center' : 'text-left items-start'
      } flex flex-col ${className}`}
    >
      {label && (
        <div className={`inline-flex flex-col ${isCenter ? 'items-center' : 'items-start'}`}>
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--muted)]">
            {label}
          </span>
          <span
            className="mt-1.5 h-[2px] w-8 bg-[#0B7658] rounded-full"
            aria-hidden="true"
          />
        </div>
      )}

      {(title || children) && (
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[var(--foreground)] font-heading">
          {title || children}
        </h2>
      )}

      {description && (
        <p className="text-sm sm:text-base text-[var(--muted)] max-w-2xl leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
