import React from 'react';
import Modal from '../../../components/ui/Modal';
import BuildDatasetPage from '../../reviewProcess/leader/StudySelectionDataSetPage';

interface DataSetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataSetModal: React.FC<DataSetModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Build Dataset" 
      size="xl"
      className="p-0"
    >
      <BuildDatasetPage />
    </Modal>
  );
};
