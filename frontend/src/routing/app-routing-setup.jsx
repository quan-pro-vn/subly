import { Layout1Page } from '@/pages/layout-1/page';
import { Layout2Page } from '@/pages/layout-2/page';
import { Layout3Page } from '@/pages/layout-3/page';
import { Layout4Page } from '@/pages/layout-4/page';
import { Layout5Page } from '@/pages/layout-5/page';
import { Layout6Page } from '@/pages/layout-6/page';
import { Layout7Page } from '@/pages/layout-7/page';
import { Layout8Page } from '@/pages/layout-8/page';
import { Layout9Page } from '@/pages/layout-9/page';
import { Layout10Page } from '@/pages/layout-10/page';
import { Layout11Page } from '@/pages/layout-11/page';
import { Layout12Page } from '@/pages/layout-12/page';
import { Layout13Page } from '@/pages/layout-13/page';
import { Layout14Page } from '@/pages/layout-14/page';
import { Route, Routes } from 'react-router';
import { Layout1 } from '@/components/layouts/layout-1';
import { Layout2 } from '@/components/layouts/layout-2';
import { Layout3 } from '@/components/layouts/layout-3';
import { Layout4 } from '@/components/layouts/layout-4';
import { Layout5 } from '@/components/layouts/layout-5';
import { Layout6 } from '@/components/layouts/layout-6';
import { Layout7 } from '@/components/layouts/layout-7';
import { Layout8 } from '@/components/layouts/layout-8';
import { Layout9 } from '@/components/layouts/layout-9';
import { Layout10 } from '@/components/layouts/layout-10';
import { Layout11 } from '@/components/layouts/layout-11';
import { Layout12 } from '@/components/layouts/layout-12';
import { Layout13 } from '@/components/layouts/layout-13';
import { Layout14 } from '@/components/layouts/layout-14';

export function AppRoutingSetup() {
  return (
    <Routes>
      <Route element={<Layout1 />}>
        <Route path="/layout-1" element={<Layout1Page />} />
        <Route path="/layout-1/dark-sidebar" element={<Layout1Page />} />
      </Route>
      <Route element={<Layout2 />}>
        <Route path="/layout-2" element={<Layout2Page />} />
      </Route>
      <Route element={<Layout3 />}>
        <Route path="/layout-3" element={<Layout3Page />} />
      </Route>
      <Route element={<Layout4 />}>
        <Route path="/layout-4" element={<Layout4Page />} />
      </Route>
      <Route element={<Layout5 />}>
        <Route path="/layout-5" element={<Layout5Page />} />
      </Route>
      <Route element={<Layout6 />}>
        <Route path="/layout-6" element={<Layout6Page />} />
      </Route>
      <Route element={<Layout7 />}>
        <Route path="/layout-7" element={<Layout7Page />} />
      </Route>
      <Route element={<Layout8 />}>
        <Route path="/layout-8" element={<Layout8Page />} />
      </Route>
      <Route element={<Layout9 />}>
        <Route path="/layout-9" element={<Layout9Page />} />
      </Route>
      <Route element={<Layout10 />}>
        <Route path="/layout-10" element={<Layout10Page />} />
      </Route>
      <Route element={<Layout11 />}>
        <Route path="/layout-11" element={<Layout11Page />} />
      </Route>
      <Route element={<Layout12 />}>
        <Route path="/layout-12" element={<Layout12Page />} />
      </Route>
      <Route element={<Layout13 />}>
        <Route path="/layout-13" element={<Layout13Page />} />
      </Route>
      <Route element={<Layout14 />}>
        <Route path="/layout-14" element={<Layout14Page />} />
      </Route>
    </Routes>
  );
}
