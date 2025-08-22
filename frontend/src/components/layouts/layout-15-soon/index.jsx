import { Layout } from './components/layout';
import { LayoutProvider } from './components/layout-context';

export function Layout1() {
  return (
    <LayoutProvider>
      <Layout />
    </LayoutProvider>
  );
}
