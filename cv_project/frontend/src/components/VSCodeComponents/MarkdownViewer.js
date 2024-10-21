import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';

const MarkdownViewer = ({ content, theme }) => {
  const style = theme === 'light' ? vs : vscDarkPlus;

  const getColor = (level) => {
    const colors = theme === 'light' 
      ? ['#D32F2F', '#7B1FA2', '#1976D2', '#388E3C', '#FFA000'] 
      : ['#FF5370', '#C792EA', '#82AAFF', '#C3E88D', '#FFCB6B'];
    return colors[level] || colors[0];
  };

  const createHeading = (level) => {
    return ({node, ...props}) => {
      const Tag = `h${level}`;
      return (
        <Tag style={{color: getColor(level - 1), borderBottom: level <= 2 ? '1px solid var(--border-color)' : 'none', paddingBottom: '0.3em'}}>
          {'#'.repeat(level) + ' '}
          <span {...props} />
        </Tag>
      );
    };
  };

  return (
    <ReactMarkdown
      components={{
        h1: createHeading(1),
        h2: createHeading(2),
        h3: createHeading(3),
        h4: createHeading(4),
        h5: createHeading(5),
        h6: createHeading(6),
        p: ({node, ...props}) => <p style={{marginBottom: '1em'}} {...props} />,
        ul: ({node, ...props}) => <ul style={{marginBottom: '1em', paddingLeft: '2em'}} {...props} />,
        ol: ({node, ...props}) => <ol style={{marginBottom: '1em', paddingLeft: '2em'}} {...props} />,
        li: ({node, children, ...props}) => {
          if (typeof children[0] === 'string' && children[0].startsWith('+ ')) {
            return <li style={{marginBottom: '0.5em'}} {...props}><span style={{color: getColor(3)}}>+ </span>{children[0].slice(2)}</li>;
          }
          return <li style={{marginBottom: '0.5em'}} {...props}>{children}</li>;
        },
        blockquote: ({node, children, ...props}) => (
          <blockquote style={{borderLeft: '0.25em solid var(--border-color)', paddingLeft: '1em', color: 'var(--text-secondary)'}} {...props}>
            <span style={{color: getColor(2)}}>&gt; </span>{children}
          </blockquote>
        ),
        code({node, inline, className, children, ...props}) {
          const match = /language-(\w+)/.exec(className || '')
          return !inline && match ? (
            <SyntaxHighlighter
              style={style}
              language={match[1]}
              PreTag="div"
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code style={{backgroundColor: 'var(--bg-secondary)', padding: '0.2em 0.4em', borderRadius: '3px'}} className={className} {...props}>
              {children}
            </code>
          )
        }
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownViewer;
