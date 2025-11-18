'use client';

import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import { ListItemNode, ListNode } from '@lexical/list';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { EditorState } from 'lexical';

interface LexicalEditorProps {
  onChange?: (editorState: EditorState) => void;
}

function onError(error: Error) {
  console.error(error);
}

export default function LexicalEditor({ onChange }: LexicalEditorProps) {
  const initialConfig = {
    namespace: 'LearnEssenceEditor',
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      CodeNode,
      CodeHighlightNode,
      TableNode,
      TableCellNode,
      TableRowNode,
      AutoLinkNode,
      LinkNode,
    ],
    onError,
    theme: {
      // Add your custom theme classes here
      paragraph: 'mb-1',
      text: {
        bold: 'font-bold',
        italic: 'italic',
        underline: 'underline',
      },
    },
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="relative border rounded-lg bg-white">
        <RichTextPlugin
          contentEditable={
            <ContentEditable className="min-h-[400px] outline-none p-4 resize-none overflow-auto" />
          }
          placeholder={
            <div className="absolute top-4 left-4 text-gray-400 pointer-events-none">
              Start writing your note...
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        {onChange && <OnChangePlugin onChange={onChange} />}
      </div>
    </LexicalComposer>
  );
}
