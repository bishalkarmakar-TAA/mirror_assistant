'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DEFAULT_PROFESSIONAL_ID } from '@/lib/constants';

interface AppContextType {
  professionalId: string;
  setProfessionalId: (id: string) => void;
  professionalName: string;
  setProfessionalName: (name: string) => void;
  professionalRole: string;
  setProfessionalRole: (role: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [professionalId, setProfessionalId] = useState(DEFAULT_PROFESSIONAL_ID);
  const [professionalName, setProfessionalName] = useState('Shreya Jain');
  const [professionalRole, setProfessionalRole] = useState('Psychologist');

  return (
    <AppContext.Provider
      value={{
        professionalId,
        setProfessionalId,
        professionalName,
        setProfessionalName,
        professionalRole,
        setProfessionalRole,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
