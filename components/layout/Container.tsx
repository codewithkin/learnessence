import React from 'react';

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Container({ children, className = '' }: ContainerProps) {
  // Make the container take remaining horizontal space and be the scrollable area
  // so the surrounding `Sidebar` remains fixed. Parent layout should be `flex h-screen`.
  return (
    <div className={`p-4 md:p-8 lg:p-12 w-full flex-1 overflow-auto ${className}`}>
      <div className="max-w-4xl w-full mx-auto">{children}</div>
    </div>
  );
}
