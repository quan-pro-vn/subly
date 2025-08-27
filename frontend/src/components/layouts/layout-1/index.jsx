import { LayoutProvider } from './components/context';
import { Main } from './components/main';

export function Layout1() {
  return (
    <>
      <title>Metronic - Layout 1</title>

      <LayoutProvider>
        <Main />
      </LayoutProvider>
    </>
  );
}
