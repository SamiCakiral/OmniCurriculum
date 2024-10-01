import React from 'react';
import { DocumentDuplicateIcon, TerminalIcon, PrinterIcon, DocumentDownloadIcon, AdjustmentsIcon } from '@heroicons/react/outline';

const SideBar = ({ setShowExplorer, setShowConsole }) => {
  const icons = [
    { Icon: DocumentDuplicateIcon, action: () => setShowExplorer(prev => !prev), label: 'Toggle Explorer' },
    { Icon: TerminalIcon, action: () => setShowConsole(prev => !prev), label: 'Toggle Console' },
    { Icon: PrinterIcon, action: () => window.print(), label: 'Print CV' },
    { Icon: DocumentDownloadIcon, action: () => alert('PDF generation not implemented'), label: 'Download PDF' },
    { Icon: AdjustmentsIcon, action: () => alert('Theme settings not implemented'), label: 'Theme Settings' }
  ];

  return (
    <div className="w-12 bg-[#333333] flex flex-col items-center py-4">
      {icons.map(({ Icon, action, label }, index) => (
        <button
          key={index}
          onClick={action}
          className="mb-4 text-[#858585] hover:text-[#cccccc] focus:outline-none"
          title={label}
        >
          <Icon className="w-6 h-6" />
        </button>
      ))}
    </div>
  );
};

export default SideBar;