import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { GWASetProvider } from "@/contexts/GWASetContext";
import Dashboard from "./pages/Dashboard";
import SubjectCalculator from "./pages/SubjectCalculator";
import GradePredictor from "./pages/GradePredictor";
import Interpreter from "./pages/Interpreter";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import BottomNav from "./components/BottomNav";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-2">
          <span className="text-3xl">🌸</span>
          <p className="text-sm text-muted-foreground italic">loading…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <GWASetProvider>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/calculator" element={<SubjectCalculator />} />
        <Route path="/predictor" element={<GradePredictor />} />
        <Route path="/insights" element={<Interpreter />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <BottomNav />
    </GWASetProvider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
