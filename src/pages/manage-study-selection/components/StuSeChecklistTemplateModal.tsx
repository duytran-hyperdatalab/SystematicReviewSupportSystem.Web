import React from 'react';
import Modal from '../../../components/ui/Modal';
import StudySelectionChecklistTemplatePage from '../../reviewProcess/leader/StudySelectionChecklistTemplatePage';

interface ChecklistTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChecklistTemplateModal: React.FC<ChecklistTemplateModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Checklist Template" 
      size="xl"
      className="p-0"
    >
      <StudySelectionChecklistTemplatePage />
    </Modal>
  );
};
