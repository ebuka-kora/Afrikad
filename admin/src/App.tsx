import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { useWebhookEvents } from "@/hooks/useWebhookEvents";
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import UsersPage from "./pages/UsersPage";
import UserProfilePage from "./pages/UserProfilePage";
import WalletsPage from "./pages/WalletsPage";
import CardsPage from "./pages/CardsPage";
import TransactionsPage from "./pages/TransactionsPage";
import FxFeesPage from "./pages/FxFeesPage";
import CompliancePage from "./pages/CompliancePage";
import DisputesPage from "./pages/DisputesPage";
import ReportsPage from "./pages/ReportsPage";
import SystemHealthPage from "./pages/SystemHealthPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();
  
  // Listen for webhook events and auto-refresh queries
  useWebhookEvents();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Index />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <UsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users/:userId"
        element={
          <ProtectedRoute>
            <UserProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/wallets"
        element={
          <ProtectedRoute>
            <WalletsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cards"
        element={
          <ProtectedRoute>
            <CardsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/transactions"
        element={
          <ProtectedRoute>
            <TransactionsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/fx-fees"
        element={
          <ProtectedRoute>
            <FxFeesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/compliance"
        element={
          <ProtectedRoute>
            <CompliancePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/disputes"
        element={
          <ProtectedRoute>
            <DisputesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <ReportsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/system-health"
        element={
          <ProtectedRoute>
            <SystemHealthPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
