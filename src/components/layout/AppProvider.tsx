'use client';

import React, { createContext, useContext, useState, useMemo } from 'react';

type Currency = 'USD' | 'IDR';

type AppContextType = {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatCurrency: (amount: number) => string;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>('IDR');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(currency === 'IDR' ? 'id-ID' : 'en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: currency === 'IDR' ? 0 : 2,
    }).format(amount);
  };
  
  const value = useMemo(() => ({
    currency,
    setCurrency,
    formatCurrency
  }), [currency]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
