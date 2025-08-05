import React, { useEffect } from 'react';

const StatusUpdateModal = ({ isOpen, onClose, parentData, onUpdateStatus }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleConfirm = () => {
    onClose();
    onUpdateStatus(parentData.parent_id, parentData.newStatus);
  };

  const handleCancel = () => {
    onClose();
    window.location.reload();
  };

  if (!isOpen) return null;

  const statusText = parentData?.newStatus === '1' ? 'Active' : 'Archive';

  return (
    <div 
      className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50 px-4 overflow-hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleCancel();
        }
      }}
      onWheel={(e) => e.preventDefault()}
      onTouchMove={(e) => e.preventDefault()}
      style={{ touchAction: 'none' }}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h5 className="text-lg font-semibold text-gray-900">Confirm Status Update</h5>
          <button
            type="button"
            onClick={handleCancel}
            className="text-gray-500 hover:text-gray-700 text-xl font-bold"
          >
            &times;
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <div className="text-center">
            <p className="text-gray-700 mb-4">
              Are you sure you want to update the status of <strong>{parentData?.parent_name}</strong> to <strong>{statusText}</strong>?
            </p>
          </div>

          {/* Buttons */}
          <div className="flex justify-center gap-4 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="bg-blue-100 text-blue-900 border border-blue-900 px-6 py-2 rounded-md font-semibold hover:opacity-75"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="bg-blue-900 text-white px-6 py-2 rounded-md font-semibold hover:opacity-75"
            >
              Yes, Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusUpdateModal;