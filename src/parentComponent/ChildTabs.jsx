import React, { useEffect, useState } from "react";

const ChildTabs = () => {
  const [children, setChildren] = useState([]);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    const storedChildren = JSON.parse(localStorage.getItem("number_of_children"));
    const storedData = JSON.parse(localStorage.getItem("responseData"));

    if (storedData?.children?.length > 0) {
      setChildren(storedData.children);
      const putcallId = sessionStorage.getItem("putcallId") || storedData.children[0].child_id;
      setActiveId(putcallId);
      localStorage.setItem("child_id", putcallId);
    }
  }, []);

  const handleChildClick = (child) => {
    localStorage.setItem("child_id", child.child_id);
    setActiveId(child.child_id);
    // Trigger reload for selected child if needed
    window.location.reload();
  };

  return (
    <ul className="space-y-2" id="dynamicChildCards">
      {children.map((child) => (
        <li key={child.child_id}>
          <button
            className={`w-full text-left px-4 py-2 rounded-md border text-sm font-medium hover:bg-blue-100 ${
              activeId === child.child_id ? "bg-blue-500 text-white" : "bg-white text-gray-800"
            }`}
            onClick={() => handleChildClick(child)}
          >
            {child.child_first_name}
          </button>
        </li>
      ))}
    </ul>
  );
};

export default ChildTabs;