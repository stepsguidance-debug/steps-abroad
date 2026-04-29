import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index.tsx";
import Login from "./pages/Login.tsx";
import Assessment from "./pages/Assessment.tsx";
import Results from "./pages/Results.tsx";
import AdminLayout from "./pages/admin/AdminLayout.tsx";
import Overview from "./pages/admin/Overview.tsx";
import ManageUsers from "./pages/admin/ManageUsers.tsx";
import QuestionBank from "./pages/admin/QuestionBank.tsx";
import StudentResult from "./pages/admin/StudentResult.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />

            <Route path="/assessment" element={<ProtectedRoute role="student"><Assessment /></ProtectedRoute>} />
            <Route path="/results"    element={<ProtectedRoute role="student"><Results /></ProtectedRoute>} />

            <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
              <Route index element={<Overview />} />
              <Route path="users" element={<ManageUsers />} />
              <Route path="questions" element={<QuestionBank />} />
              <Route path="results/:userId" element={<StudentResult />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
