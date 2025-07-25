import React from 'react';
import FormItem from './FormItem';

const FormSection = ({ section, formStatus, isOpen, onToggle, onItemClick, selectedSubForm}) => {
  
  return (
    <div className="rounded">
      <button
        onClick={() => onToggle(section.key)}
        className={`group relative flex w-full items-center justify-between px-3 py-2 font-semibold rounded border cursor-pointer hover:opacity-90 ${
          isOpen ? "bg-[#0F2D52] text-white" : "bg-[#D8E9FF] text-black"
        }`}
        aria-expanded={isOpen}
      >
        <div className="flex gap-1 items-center">
          <span>{section.title}</span>
          <img
            src={formStatus[section.key]?.completed ? "/image/tick.png" : "/image/circle-with.png"}
            alt={formStatus[section.key]?.completed ? "Completed" : "Incomplete"}
            className="w-5 h-5"
          />
        </div>
        <span className="-me-1 ms-auto h-5 w-5 shrink-0 rotate-[-180deg] transition-transform duration-200 ease-in-out group-aria-expanded:rotate-0 motion-reduce:transition-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className={`h-5 w-5 ${isOpen ? "text-white" : "text-gray-500"}`}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </span>
      </button>

      <div
        className={`transition-[max-height,opacity] duration-800 ease-in-out overflow-hidden ${
          isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {isOpen && section.items && (
          <div className="bg-white border text-xs font-bold border-[#0F2D52] text-[#0F2D52] border-b-2 mb-2 rounded mt-2">
            {section.items.map((item, i) => (
              <React.Fragment key={i}>
             
              <FormItem 
                key={i}
                item={item}
                sectionKey={section.key}
                formStatus={formStatus}
                onItemClick={onItemClick}
                isSelected={item  === selectedSubForm}
               
              />
              </React.Fragment>
           ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormSection;