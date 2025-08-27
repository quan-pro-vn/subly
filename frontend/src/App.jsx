import { AppRouting } from '@/routing/app-routing';
import { ThemeProvider } from 'next-themes';
import { BrowserRouter } from 'react-router-dom';
import { LoadingBarContainer } from 'react-top-loading-bar';
import { Toaster } from '@/components/ui/sonner';

const { BASE_URL } = import.meta.env;

export function App() {
  return (
    <BrowserRouter basename={BASE_URL}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        storageKey="vite-theme"
        enableSystem
        disableTransitionOnChange
        enableColorScheme
      >
        <LoadingBarContainer>
          <Toaster />
          <AppRouting />
        </LoadingBarContainer>
      </ThemeProvider>
    </BrowserRouter>
  );
}
