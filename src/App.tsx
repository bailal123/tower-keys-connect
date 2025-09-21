import React, { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n/config';
import { DashboardLayout } from './components/layout/DashboardLayout';
import Index from "./pages/Index";
import Countries from "./pages/Countries";
import Towers from "./pages/Towers";
import UnitDesigns from "./pages/UnitDesigns";
import Appliances from "./pages/Appliances";
import Blocks from "./pages/Blocks";
import TowerFeatures from "./pages/TowerFeatures";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Set initial direction based on language
    document.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<DashboardLayout><Index /></DashboardLayout>} />
              <Route path="/countries" element={<DashboardLayout><Countries /></DashboardLayout>} />
              <Route path="/towers" element={<DashboardLayout><Towers /></DashboardLayout>} />
              <Route path="/unit-designs" element={<DashboardLayout><UnitDesigns /></DashboardLayout>} />
              <Route path="/appliances" element={<DashboardLayout><Appliances /></DashboardLayout>} />
              <Route path="/blocks" element={<DashboardLayout><Blocks /></DashboardLayout>} />
              <Route path="/tower-features" element={<DashboardLayout><TowerFeatures /></DashboardLayout>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </I18nextProvider>
    </QueryClientProvider>
  );
};

export default App;
