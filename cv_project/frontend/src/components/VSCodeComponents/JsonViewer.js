import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';

const JsonViewer = ({ content, theme }) => {
  const style = theme === 'light' ? vs : vscDarkPlus;

  return (
    <SyntaxHighlighter 
      language="json" 
      style={style}
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
