import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mosaic, MosaicWindow, MosaicContext } from 'react-mosaic-component';
import 'react-mosaic-component/react-mosaic-component.css';
import './editor-mosaic-theme.css';
import JsonViewer from './JsonViewer';
import MarkdownViewer from './MarkdownViewer';

const EditorPanel = ({ file, content, theme }) => {
  return (
    <div className="h-full bg-[var(--bg-primary)] overflow-auto">
      {file.name.endsWith('.json') ? (
        <JsonViewer content={content} theme={theme} />
      ) : file.name.endsWith('.md') ? (
        <MarkdownViewer content={content} theme={theme} />
      ) : (
        <pre className="p-4 text-sm font-mono whitespace-pre-wrap text-[var(--text-primary)]">
          {content}
        </pre>
      )}
    </div>
  );
};

const Editor = ({ activeFiles, addActiveFile, removeFile, showSettings, settingsContent, theme, language }) => {
  const [localActiveFiles, setLocalActiveFiles] = useState([]);

  useEffect(() => {
    setLocalActiveFiles(activeFiles);
  }, [activeFiles]);

  const renderTile = (id, path) => {
    const file = localActiveFiles.find(f => f.name === id);
    if (!file) return null;
    
    if (file.name === 'settings.json' && showSettings) {
      return (
        <MosaicWindow
          path={path}
          title="Paramètres"
          toolbarControls={[<button key="close" onClick={() => removeFile('settings.json')} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">×</button>]}
          className="bg-[var(--bg-secondary)]"
        >
          {settingsContent}
        </MosaicWindow>
      );
    }

    return (
      <MosaicWindow
        path={path}
        title={`${file.section}/${file.name}`}
        toolbarControls={[<button key="close" onClick={() => removeFile(file.name)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">×</button>]}
        className="bg-[var(--bg-secondary)] text-[var(--text-primary)]"
      >
        <EditorPanel file={file} content={file.content} theme={theme} />
      </MosaicWindow>
    );
  };

  const initialValue = localActiveFiles.reduce((acc, file, index) => {
    if (index === 0) return file.name;
    return {
      direction: 'row',
      first: acc,
      second: file.name,
      splitPercentage: 50,
    };
  }, null);

  return (
    <div className="h-full">
      <MosaicContext.Provider value={{ mosaicActions: {}, mosaicId: 'my-mosaic' }}>
        <Mosaic
          renderTile={renderTile}
          initialValue={initialValue}
          className="mosaic-editor-theme bg-[var(--bg-primary)]"
        />
      </MosaicContext.Provider>
    </div>
  );
};

export default Editor;
