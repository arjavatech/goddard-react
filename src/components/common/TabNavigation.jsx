import React from 'react';

const TabNavigation = ({ tabs, activeTab, onTabChange, className = "" }) => {
  return (
    <ul className={`flex bg-[#D8E9FF] rounded-t-md ${className}`} role="tablist">
      {tabs.map((tab, index) => (
        <li key={tab.id} className="flex-1">
          <button
            className={`w-full py-4 px-6 text-center font-semibold transition-colors ${
              index === 0 ? 'rounded-tl-md' : ''
            } ${
              index === tabs.length - 1 ? 'rounded-tr-md' : ''
            } ${
              activeTab === tab.id 
                ? 'bg-[#0F2D52] text-[#D8E9FF]' 
                : 'bg-[#D8E9FF] text-[#0F2D52] hover:bg-[#c5d9f7]'
            }`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        </li>
      ))}
    </ul>
  );
};

export default TabNavigation;