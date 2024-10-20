import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const JsonViewer = ({ content }) => {
  return (
    <SyntaxHighlighter 
      language="json" 
      style={vscDarkPlus}
      customStyle={{
        margin: 0,
        padding: '1rem',
        backgroundColor: 'var(--bg-primary)',
        fontSize: '0.9rem',
        lineHeight: '1.5',
      }}
    >
      {content}
    </SyntaxHighlighter>
  );
};

export default JsonViewer;
