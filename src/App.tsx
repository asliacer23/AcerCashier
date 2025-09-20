import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import Index from "./pages/Index";
import POSPage from "./pages/POSPage";
import ProductsPage from "./pages/ProductsPage";
import NotFound from "./pages/NotFound";
import ReceiptsPage from "./pages/ReceiptsPage";

const queryClient = new QueryClient();

console.log("App component loading...");

const App = () => {
  console.log("App component rendering...");
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Navbar />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/pos" element={<POSPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/receipts" element={<ReceiptsPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
