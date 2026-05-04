import React from 'react';
import Modal from '../../../components/ui/Modal';
import ReviewerProgressPage from '../../reviewProcess/leader/ReviewerProgressPage';

interface ReviewerProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReviewerProgressModal: React.FC<ReviewerProgressModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Reviewer Progress" 
      size="xl"
      className="p-0"
    >
      <div className="h-[80vh] overflow-y-auto custom-scrollbar">
        <ReviewerProgressPage />
      </div>
    </Modal>
  );
};
