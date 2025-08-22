import { createContext, useContext, useState } from 'react';

// Define the shape of the layout state

// Create the context
const LayoutContext = createContext(undefined);

// Provider component

export function LayoutProvider({ children }) {
  const [sidebarCollapse, setSidebarCollapse] = useState(false);

  return (
    <LayoutContext.Provider
      value={{
        sidebarCollapse,
        setSidebarCollapse,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
}

// Custom hook for consuming the context
// eslint-disable-next-line react-refresh/only-export-components
export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};
