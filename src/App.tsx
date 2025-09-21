import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Voice from "./pages/Voice";
import Processing from "./pages/Processing";
import Results from "./pages/Results";
import BatchUpload from "./pages/BatchUpload";
import BatchProcessing from "./pages/BatchProcessing";
import BatchReview from "./pages/BatchReview";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Voice />} />
          <Route path="/processing" element={<Processing />} />
          <Route path="/results" element={<Results />} />
          <Route path="/batch-upload" element={<BatchUpload />} />
          <Route path="/batch-processing/:batchId" element={<BatchProcessing />} />
          <Route path="/batch-review/:batchId" element={<BatchReview />} />
          <Route path="/batch-results/:batchId" element={<Results />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
