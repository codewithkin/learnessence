'use client';

import React from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin';
import { MyOnChangePlugin, RehydrationPlugin } from './useLexicalSerialization';
import ToolbarPlugin from './plugins/ToolbarPlugin';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import { ListItemNode, ListNode } from '@lexical/list';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { $createHeadingNode } from '@lexical/rich-text';
import { $createParagraphNode, $createTextNode, $getRoot } from 'lexical';

interface LexicalEditorProps {
  onChange?: (serializedEditorState: string) => void;
  initialEditorState?: string | null;
}

function onError(error: Error) {
  console.error(error);
}

function prepareInitialEditorState() {
  const root = $getRoot();
  if (root.getFirstChild() === null) {
    const heading = $createHeadingNode('h1');
    heading.append($createTextNode('untitled note'));
    root.append(heading);

    const paragraph = $createParagraphNode();
    paragraph.append($createTextNode('Start writing your note here'));
    root.append(paragraph);
  }
}

export default function LexicalEditor({ onChange, initialEditorState }: LexicalEditorProps) {
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
    editorState: initialEditorState ? undefined : prepareInitialEditorState,
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
      <ToolbarPlugin />
      {/* @ts-expect-error - RichTextPlugin ErrorBoundary typing mismatch in this project setup */}
      <RichTextPlugin
        contentEditable={
          <ContentEditable className="min-h-[400px] h-full outline-none p-4 resize-none overflow-auto" />
        }
      />
      <HistoryPlugin />
      <AutoFocusPlugin />
      <ListPlugin />
      <CheckListPlugin />
      {/* rehydrate from provided initialEditorState and registerUpdateListener to forward serialized EditorState */}
      {onChange && <MyOnChangePlugin onChange={onChange} />}
      <RehydrationPlugin initialEditorState={initialEditorState} />
    </LexicalComposer>
  );
}
