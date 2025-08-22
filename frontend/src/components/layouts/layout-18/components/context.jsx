import { createContext, useContext, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { TooltipProvider } from '@/components/ui/tooltip';

const HEADER_HEIGHT = '60px';
const HEADER_HEIGHT_MOBILE = '56px';
const SIDEBAR_WIDTH = '16rem';
const SIDEBAR_WIDTH_MOBILE = '16rem';

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

  const defaultStyle = {
    '--sidebar-width': SIDEBAR_WIDTH,
    '--sidebar-width-mobile': SIDEBAR_WIDTH_MOBILE,
    '--header-height': HEADER_HEIGHT,
    '--header-height-mobile': HEADER_HEIGHT_MOBILE,
  };

  const style = {
    ...defaultStyle,
    ...customStyle,
  };

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
      }}
    >
      <div data-slot="layout-wrapper" className="flex grow" style={style}>
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
