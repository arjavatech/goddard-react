import React from "react";

const ChildTabs = ({ children = [], activeChildId, onChildSelect }) => {
  const handleChildClick = (child) => {
    if (onChildSelect) {
      onChildSelect(child.child_id || child.id);
    }
  };

  if (!children || children.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-gray-600">No children found for this account.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-[#0F2D52] mb-4">Select Child</h3>
      <div className="flex flex-wrap gap-2">
        {children.map((child) => {
          const childId = child.child_id || child.id;
          const childName = child.child_first_name || child.firstName || child.name;
          const isActive = activeChildId === childId;
          
          return (
            <button
              key={childId}
              className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors ${
                isActive 
                  ? "bg-[#0F2D52] text-white border-[#0F2D52]" 
                  : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50"
              }`}
              onClick={() => handleChildClick(child)}
            >
              {childName}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ChildTabs;