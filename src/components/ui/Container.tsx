import React from 'react';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

export default function Container({
  children,
  className = '',
  as: Component = 'div',
  ...props
}: ContainerProps) {
  return (
    <Component
      className={`max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 w-full ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
