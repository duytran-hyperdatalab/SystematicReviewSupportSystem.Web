import React from 'react';
import { Toaster } from 'react-hot-toast';

export const ToastProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <>
      {children}
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{
          top: 40,
          left: 20,
          bottom: 20,
          right: 20,
        }}
        toastOptions={{
          // We'll mostly use custom toasts, but these are defaults
          duration: 4000,
          style: {
            maxWidth: '450px',
          },
        }}
      />
    </>
  );
};
