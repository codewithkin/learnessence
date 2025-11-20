'use client';

import React, { useEffect, useRef, useCallback } from 'react';

interface RichTextEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  className?: string;
  placeholder?: string;
}

function isInsidePre(node: Node | null) {
  while (node) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((node as any).nodeName === 'PRE') return true;
    node = node.parentNode;
  }
  return false;
}

export default function RichTextEditor({
  value = '',
  onChange,
  className = '',
  placeholder,
}: RichTextEditorProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (el.innerText !== value) el.innerText = value || '';
  }, [value]);

  const emitChange = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    onChange?.(el.innerText);
  }, [onChange]);

  const handleInput = () => {
    emitChange();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');

    // Try to use execCommand for broad support; it preserves newlines reasonably.
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const succeeded = document.execCommand && document.execCommand('insertText', false, text);
      if (!succeeded) {
        // Fallback: insert nodes manually preserving line breaks
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;
        const range = sel.getRangeAt(0);
        range.deleteContents();
        const lines = text.split(/\r\n|\r|\n/);
        lines.forEach((line, i) => {
          if (i > 0) {
            const br = document.createElement('br');
            range.insertNode(br);
            range.setStartAfter(br);
          }
          const tn = document.createTextNode(line);
          range.insertNode(tn);
          range.setStartAfter(tn);
        });
      }
    } catch {
      // ignore errors and fallback
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);
      range.deleteContents();
      const lines = text.split(/\r\n|\r|\n/);
      lines.forEach((line, i) => {
        if (i > 0) {
          const br = document.createElement('br');
          range.insertNode(br);
          range.setStartAfter(br);
        }
        const tn = document.createTextNode(line);
        range.insertNode(tn);
        range.setStartAfter(tn);
      });
    }

    // Emit change after paste
    setTimeout(() => emitChange(), 0);
  };

  return (
    <div className={`rich-text-editor ${className}`}>
      <div
        ref={ref}
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        suppressContentEditableWarning
        role="textbox"
        aria-label={placeholder}
        className="min-h-[200px] outline-none whitespace-pre-wrap text-gray-400"
      />
    </div>
  );
}
