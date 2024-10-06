import React from 'react';

const Chronologie = ({ items }) => {
  return (
    <div className="bg-[#252526] text-[#cccccc] p-4 overflow-y-auto h-40">
      <div className="text-xs font-bold uppercase tracking-wide mb-2 transform -rotate-90 origin-top-left absolute top-0 left-4">Chronologie</div>
      <div className="flex flex-col space-y-4 ml-6">
        {items.map((item, index) => (
          <div key={index} className="flex items-center">
            <div className={`w-3 h-3 rounded-full ${item.type === 'education' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
            <div className="w-10 h-px bg-gray-600 mx-2"></div>
            <div className="flex flex-col">
              <div className="text-xs whitespace-nowrap">{item.title}</div>
              <div className="text-xs text-gray-500">{new Date(item.date).toLocaleDateString()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Chronologie;