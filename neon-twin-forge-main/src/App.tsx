// src/App.tsx

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"; // Added Navigate for protected routing
import { ThemeProvider } from "@/hooks/useTheme";

// Import all Page Components
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import TwinBuilder from "./pages/TwinBuilder";
import Chat from "./pages/Chat";
import Simulation from "./pages/Simulation";
import Analytics from "./pages/Analytics";
import Admin from "./pages/Admin";
import SurveyPage from "./pages/SurveyPage"; // <-- New mandatory page
import NotFound from "./pages/NotFound";

// Assume the isUserLoggedIn utility exists in lib/auth-check.js
const isUserLoggedIn = () => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    return !!token && !!user;
};

const queryClient = new QueryClient();

// Helper component to enforce login access
const ProtectedRoute = ({ element }: { element: React.ReactElement }) => {
    const loggedIn = isUserLoggedIn();
    // If not logged in, redirect to signup/login page
    return loggedIn ? element : <Navigate to="/signup" replace />; 
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* -------------------- Public Routes -------------------- */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* -------------------- Protected/Conditional Routes -------------------- */}
            
            {/* The Dashboard acts as the primary access gate, handling the redirect to /survey if needed. */}
            <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} /> 

            {/* Survey Route: Must be protected as only logged-in users need to access it. 
               The Dashboard component handles the redirect *TO* this route. */}
            <Route path="/survey" element={<ProtectedRoute element={<SurveyPage />} />} /> 

            {/* General App Routes (Require Login) */}
            <Route path="/twin-builder" element={<ProtectedRoute element={<TwinBuilder />} />} />
            <Route path="/chat" element={<ProtectedRoute element={<Chat />} />} />
            <Route path="/simulation" element={<ProtectedRoute element={<Simulation />} />} />
            <Route path="/analytics" element={<ProtectedRoute element={<Analytics />} />} />
            <Route path="/admin" element={<ProtectedRoute element={<Admin />} />} />

            {/* -------------------- Fallback Route -------------------- */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;