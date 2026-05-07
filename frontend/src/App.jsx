import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

import { useStore } from './store/useStore';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { BackgroundManager } from './components/3d/BackgroundManager';

// Pages
import { Landing } from './pages/Landing';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { Notes } from './pages/Notes';
import { Doubts } from './pages/Doubts';
import { Quiz } from './pages/Quiz';
import { Planner } from './pages/Planner';
import { Profile } from './pages/Profile';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

// Layout for authenticated pages:
// Desktop → sidebar left + content right
// Mobile  → top header + content + bottom tab nav
const AppLayout = () => {
  const sidebarOpen = useStore((s) => s.sidebarOpen);

  return (
    <div className="min-h-screen min-h-[100dvh] relative">
      <BackgroundManager />
      <Sidebar />
      <MobileNav />

      {/* Main Content Area */}
      <motion.main
        initial={false}
        animate={{ marginLeft: typeof window !== 'undefined' && window.innerWidth >= 1024 ? (sidebarOpen ? 260 : 72) : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="min-h-screen min-h-[100dvh] relative z-10
          pt-[calc(env(safe-area-inset-top,0px)+4.5rem)] lg:pt-6
          pb-[calc(env(safe-area-inset-bottom,0px)+5rem)] lg:pb-6
          px-4 sm:px-6 lg:px-8"
      >
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="py-2 sm:py-4 lg:py-6"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </motion.main>
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/callback" element={<Auth />} />

            {/* Protected with Layout */}
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/notes" element={<Notes />} />
              <Route path="/doubts" element={<Doubts />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/planner" element={<Planner />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Routes>
        </BrowserRouter>

        <Toaster
          position="top-center"
          toastOptions={{
            style: { borderRadius: '12px', padding: '12px 16px', fontSize: '14px' },
          }}
          richColors
          closeButton
          mobileOffset={60}
        />
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;
