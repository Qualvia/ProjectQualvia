import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { BusinessProvider } from './contexts/BusinessContext';
import { UsuarioInternoProvider, useUsuarioInterno } from './contexts/UsuarioInternoContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Registros from './pages/Registros.jsx';
import Documentos from './pages/Documentos';
import Checklist from './pages/Checklist';
import Asistente from './pages/Asistente';
import Ajustes from './pages/Ajustes';
import Onboarding from './pages/Onboarding';

function OperarioGuard({ children }) {
  const { esOperario } = useUsuarioInterno();
  if (esOperario) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-base font-medium text-foreground">No tienes permiso para acceder a esta sección</p>
        <Link to="/registros" className="px-5 py-2.5 rounded-xl bg-[#6BB68A] text-white text-sm font-semibold hover:bg-[#5aa377] transition-colors">Volver</Link>
      </div>
    );
  }
  return children;
}

const AuthenticatedApp = () => {
  const { user, isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <UsuarioInternoProvider>
    <BusinessProvider authenticatedUser={user}>
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/registros" element={<Registros />} />
          <Route path="/documentos" element={<OperarioGuard><Documentos /></OperarioGuard>} />
          <Route path="/checklist" element={<Checklist />} />
          <Route path="/asistente" element={<OperarioGuard><Asistente /></OperarioGuard>} />
          <Route path="/ajustes" element={<OperarioGuard><Ajustes /></OperarioGuard>} />
        </Route>
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </BusinessProvider>
    </UsuarioInternoProvider>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App