import { useState } from 'react';

export const useAlertManager = () => {
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => {
      setAlert({ show: false, type: '', message: '' });
    }, 3000);
  };

  const closeAlert = () => {
    setAlert({ show: false, type: '', message: '' });
  };

  return {
    alert,
    showAlert,
    closeAlert
  };
};