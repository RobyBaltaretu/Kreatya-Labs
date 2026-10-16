import {
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
  useParams,
} from '@tanstack/react-router';
import { Layout } from './components/Layout';
import { Dashboard } from './features/dashboard';
import { Leads } from './features/leads';
import { ProjectEditor, ProjectList } from './features/projects';
import { Seo } from './features/seo';
import { Infra, Settings } from './features/settings';

const root = createRootRoute({ component: Layout });

function Editor() {
  const { id } = useParams({ from: '/proyectos/$id' });
  return <ProjectEditor key={id} id={id} />;
}
const routes = [
  createRoute({ getParentRoute: () => root, path: '/', component: Dashboard }),
  createRoute({ getParentRoute: () => root, path: '/leads', component: Leads }),
  createRoute({ getParentRoute: () => root, path: '/proyectos', component: ProjectList }),
  createRoute({ getParentRoute: () => root, path: '/proyectos/$id', component: Editor }),
  createRoute({ getParentRoute: () => root, path: '/seo', component: Seo }),
  createRoute({ getParentRoute: () => root, path: '/configuracion', component: Settings }),
  createRoute({ getParentRoute: () => root, path: '/infraestructura', component: Infra }),
];

export const router = createRouter({
  routeTree: root.addChildren(routes),
  // Con VITE_HASH_ROUTER=1 el panel funciona servido como estático sin reescrituras.
  ...(import.meta.env.VITE_HASH_ROUTER === '1' ? { history: createHashHistory() } : {}),
  defaultNotFoundComponent: () => <p className="text-muted">Página no encontrada.</p>,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
