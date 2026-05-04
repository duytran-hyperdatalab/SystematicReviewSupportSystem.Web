import React from 'react';
import Modal from '../../../components/ui/Modal';
import ProcessSettingPage from '../../reviewProcess/leader/settings/ProcessSettingPage';

interface ProcessSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProcessSettingsModal: React.FC<ProcessSettingsModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Process Settings" 
      size="xl"
    >
      <div className="p-2">
        <ProcessSettingPage />
      </div>
    </Modal>
  );
};
