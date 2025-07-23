import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Header from './Header';
import Alert from './Alert';
import ClassroomRepo from './ClassroomRepo';
import FormRepo from './FormRepo';
import TabNavigation from './common/TabNavigation';
import { useAlertManager } from './common/AlertManager';

const FormsRepository = () => {
  const { isAuthenticated, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('classroom');
  const { alert, showAlert, closeAlert } = useAlertManager();

  const tabs = [
    { id: 'classroom', label: 'Classroom Repo' },
    { id: 'forms', label: 'Forms Repo' }
  ];

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <Header onSignOut={signOut} sidebar={true} component={"ClassroomFormManage"} />
      
      <Alert 
        show={alert.show}
        type={alert.type}
        message={alert.message}
        onClose={closeAlert}
      />

      <div className="container mx-auto px-4">
        <div className="rounded shadow-lg m-4">
          <TabNavigation 
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          <div className="rounded-b-md">
            {activeTab === 'classroom' && (
              <ClassroomRepo onAlert={showAlert} />
            )}

            {activeTab === 'forms' && (
              <FormRepo onAlert={showAlert} />
            )}
          </div>
        </div>
      </div>

      {/* External Scripts */}
      <script src="https://code.jquery.com/jquery-3.5.1.js"></script>
      <script src="https://cdn.datatables.net/1.11.5/js/jquery.dataTables.min.js"></script>
      <script src="https://unpkg.com/xlsx@0.15.1/dist/xlsx.full.min.js"></script>
    </div>
  );
};

export default FormsRepository;