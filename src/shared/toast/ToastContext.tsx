import React from 'react';
import { ToastContainer } from '../components/Toast/ToastContainer';

export interface ToastProviderProps {
  readonly children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  return (
    <>
      {children}
      <ToastContainer />
    </>
  );
};
