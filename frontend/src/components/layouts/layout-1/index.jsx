import { LayoutProvider } from './components/context';
import { Main } from './components/main';

export function Layout1() {
  return (
    <>
      <title>{import.meta.env.VITE_APP_NAME || 'Application'}</title>

      <LayoutProvider>
        <Main />
      </LayoutProvider>
    </>
  );
}
