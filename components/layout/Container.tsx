import React from 'react';

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Container({ children, className = '' }: ContainerProps) {
  return (
    <div className={`p-2 md:p-8 lg:p-12 w-full ${className}`}>
      <div className="max-w-4xl w-full mx-auto">{children}</div>
    </div>
  );
}
