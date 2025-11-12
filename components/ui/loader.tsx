'use client';

import * as React from 'react';

function Loader({ className }: { className?: string }) {
  return <div className={className ? `loader ${className}` : 'loader'} aria-hidden />;
}

export { Loader };
