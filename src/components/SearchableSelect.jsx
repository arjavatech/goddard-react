import React, { useState, useRef, useEffect } from 'react';

const SearchableSelect = ({ 
  id, 
  options = [], 
  value = [], 
  onChange, 
  multiple = false, 
  placeholder = "Select...",
  className = "",
  size = 6
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionClick = (option) => {
    if (multiple) {
      const newValue = value.includes(option.value)
        ? value.filter(v => v !== option.value)
        : [...value, option.value];
      onChange(newValue);
    } else {
      onChange([option.value]);
      setIsOpen(false);
    }
  };

  const getDisplayText = () => {
    if (value.length === 0) return placeholder;
    if (multiple) {
      const selectedOptions = options.filter(opt => value.includes(opt.value));
      if (selectedOptions.length === 0) return placeholder;
      if (selectedOptions.length === 1) return selectedOptions[0].label;
      return `${selectedOptions.length} items selected`;
    }
    const selectedOption = options.find(opt => opt.value === value[0]);
    return selectedOption ? selectedOption.label : placeholder;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className={`w-full h-10 px-3 py-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-[#0F2D52] focus:border-[#0F2D52] cursor-pointer ${className}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex justify-between items-center h-full">
          <span className="truncate text-sm">{getDisplayText()}</span>
          <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'} text-gray-400 flex-shrink-0`}></i>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg">
          <div className="p-2">
            <input
              type="text"
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#0F2D52]"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-gray-500 text-sm">No options found</div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={`px-3 py-2 cursor-pointer hover:bg-blue-50 text-sm ${
                    value.includes(option.value) ? 'bg-blue-100 text-blue-800' : 'text-gray-700'
                  }`}
                  onClick={() => handleOptionClick(option)}
                >
                  <div className="flex items-center">
                    {multiple && (
                      <input
                        type="checkbox"
                        checked={value.includes(option.value)}
                        onChange={() => {}}
                        className="mr-2"
                      />
                    )}
                    {option.label}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;