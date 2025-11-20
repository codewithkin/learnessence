'use client';

import React, { useEffect, useRef } from 'react';

interface EditableTitleProps {
  value?: string;
  placeholder?: string;
  className?: string;
  onChange?: (next: string) => void;
}

export default function EditableTitle({
  value = '',
  placeholder = 'Untitled note',
  className = '',
  onChange,
}: EditableTitleProps) {
  const ref = useRef<HTMLParagraphElement | null>(null);

  // keep DOM in sync when parent-controlled value changes
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const display = value && value.length > 0 ? value : 'Untitled note';
    if (el.innerText !== display) {
      el.innerText = display;
    }

    // If parent didn't provide a value, emit the default as actual content
    if (!value) {
      onChange?.('Untitled note');
    }
  }, [value, onChange]);

  const handleInput = () => {
    const el = ref.current;
    if (!el) return;
    const text = el.innerText || '';
    onChange?.(text);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    // Insert as plain text
    document.execCommand('insertText', false, text);
    handleInput();
  };

  return (
    <div className="relative">
      <p
        ref={ref}
        contentEditable
        role="textbox"
        suppressContentEditableWarning
        onInput={handleInput}
        onBlur={handleInput}
        onPaste={handlePaste}
        className={`${className} min-h-[1.2em] outline-none`}
      />
    </div>
  );
}
