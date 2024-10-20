import React from 'react';
import { DocumentDuplicateIcon, TerminalIcon, PrinterIcon, DocumentDownloadIcon, AdjustmentsIcon, CogIcon } from '@heroicons/react/outline';

const SideBar = ({ setShowExplorer, setShowConsole, openSettings, openCVPanel }) => {
  const icons = [
    { Icon: DocumentDuplicateIcon, action: () => setShowExplorer(prev => !prev), label: 'Toggle Explorer' },
    { Icon: TerminalIcon, action: () => setShowConsole(prev => !prev), label: 'Toggle Console' },
    { Icon: PrinterIcon, action: () => window.print(), label: 'Print CV' },
    { Icon: DocumentDownloadIcon, action: openCVPanel, label: 'View and Download CV' },
    { Icon: CogIcon, action: openSettings, label: 'Paramètres' }
  ];

  return (
    <div className="w-12 bg-[var(--bg-tertiary)] flex flex-col items-center py-4 justify-between">
      <div>
        {icons.filter(icon => icon.label !== 'Paramètres').map(({ Icon, action, label }, index) => (
          <button
            key={index}
            onClick={action}
            className="mb-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-bg)] focus:outline-none p-2 rounded"
            title={label}
          >
            <Icon className="w-6 h-6" />
          </button>
        ))}
      </div>
      {icons.find(icon => icon.label === 'Paramètres') && (
        <button
          onClick={icons.find(icon => icon.label === 'Paramètres').action}
          className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-bg)] focus:outline-none p-2 rounded"
          title="Paramètres"
        >
          <CogIcon className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default SideBar;
