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
    <div className="w-12 bg-gray-900 flex flex-col items-center py-4 h-full">
      {icons.map(({ Icon, action, label }, index) => (
        <div 
          key={index} 
          className="mb-4 text-gray-400 hover:text-white cursor-pointer" 
          onClick={action}
          title={label}
        >
          <Icon className="w-6 h-6" />
        </div>
      ))}
    </div>
  );
};

export default SideBar;