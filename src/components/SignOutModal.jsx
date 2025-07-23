// import React from 'react';

// const SignOutModal = ({ isOpen, onClose, onConfirm }) => {
//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50 px-4">
//       <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto">
//         {/* Modal Header */}
//         <div className="flex justify-between items-center p-4 border-b border-gray-200">
//           <h5 className="text-lg font-semibold text-gray-900">Confirm Sign Out</h5>
//           <button
//             type="button"
//             onClick={onClose}
//             className="text-gray-500 hover:text-gray-700 text-xl font-bold"
//           >
//             &times;
//           </button>
//         </div>

//         {/* Modal Body */}
//         <div className="p-6">
//           <div className="flex items-center mb-4">
//             <div className="flex-shrink-0">
//               <svg className="h-10 w-10 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
//                 />
//               </svg>
//             </div>
//             <div className="ml-4">
//               <h3 className="text-lg font-medium text-gray-900">
//                 Are you sure you want to sign out?
//               </h3>
//               <p className="text-sm text-gray-500 mt-1">
//                 You will be redirected to the login page.
//               </p>
//             </div>
//           </div>

//           {/* Buttons */}
//           <div className="flex justify-end gap-3 pt-4">
//             <button
//               type="button"
//               onClick={onClose}
//               className="bg-gray-100 text-gray-700 border border-gray-300 px-4 py-2 rounded-md font-medium hover:bg-gray-200 transition-colors"
//             >
//               Cancel
//             </button>
//             <button
//               type="button"
//               onClick={onConfirm}
//               className="bg-[#002e4d] text-white px-4 py-2 rounded-md font-medium hover:bg-red-700 transition-colors"
//             >
//               Sign Out
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SignOutModal;


import React, { useEffect } from 'react';

const SignOutModal = ({ isOpen, onClose, onConfirm }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }

    // Clean up on unmount
    return () => document.body.classList.remove('overflow-hidden');
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-sm px-4">
      
      {/* Optional faded background content */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <h1 className="text-6xl sm:text-8xl font-bold text-gray-800 opacity-10 select-none">
          Arjava
        </h1>
      </div>

      {/* Modal box */}
      <div className="relative z-10 bg-white rounded-lg shadow-xl w-full max-w-md mx-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h5 className="text-lg font-semibold text-gray-900">Confirm Sign Out</h5>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl font-bold"
          >
            &times;
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <svg className="h-10 w-10 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">
                Are you sure you want to sign out?
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                You will be redirected to the login page.
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-100 text-gray-700 border border-gray-300 px-4 py-2 rounded-md font-medium hover:bg-gray-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="bg-[#002e4d] text-white px-4 py-2 rounded-md font-medium hover:bg-[#1a4066] transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignOutModal;