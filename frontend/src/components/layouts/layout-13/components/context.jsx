import { createContext, useContext, useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { TooltipProvider } from '@/components/ui/tooltip';

const HEADER_HEIGHT = '60px';
const SIDEBAR_WIDTH = '16rem';
const SIDEBAR_HEADER_HEIGHT = '60px';
// Define the shape of the layout state

// Create the context
const LayoutContext = createContext(undefined);

// Provider component

export function LayoutProvider({
  children,
  style: customStyle,
  bodyClassName = '',
}) {
  const isMobile = useIsMobile();
  const [isSidebarSecondaryOpen, setIsSidebarSecondaryOpen] = useState(true);

  const defaultStyle = {
    '--sidebar-width': SIDEBAR_WIDTH,
    '--header-height': HEADER_HEIGHT,
    '--sidebar-header-height': SIDEBAR_HEADER_HEIGHT,
  };

  const style = {
    ...defaultStyle,
    ...customStyle,
  };

  // Sidebar toggle function
  const sidebarSecondaryToggle = () =>
    setIsSidebarSecondaryOpen((open) => !open);

  // Set body className on mount and clean up on unmount
  useEffect(() => {
    if (bodyClassName) {
      const body = document.body;
      const existingClasses = body.className;

      // Add new classes
      body.className = `${existingClasses} ${bodyClassName}`.trim();

      // Cleanup function to remove classes on unmount
      return () => {
        body.className = existingClasses;
      };
    }
  }, [bodyClassName]);

  return (
    <LayoutContext.Provider
      value={{
        bodyClassName,
        style,
        isMobile,
        isSidebarSecondaryOpen,
        sidebarSecondaryToggle,
      }}
    >
      <div
        data-slot="layout-wrapper"
        className="flex grow"
        data-sidebar-secondary-open={isSidebarSecondaryOpen}
        style={style}
      >
        <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
      </div>
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
