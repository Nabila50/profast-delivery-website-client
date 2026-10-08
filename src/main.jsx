import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { router } from "./router/router.jsx";
import "aos/dist/aos.css";
import AOS from "aos";
import AuthProvider from "./Context/AuthProvider.jsx";
import { RouterProvider } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import BackToTop from "./pages/shared/BackToTop/BackToTopBtn.jsx";

AOS.init();

const queryClient = new QueryClient

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <div className="font-urbanist max-w-7xl mx-auto">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
          <BackToTop></BackToTop>
        </AuthProvider>
      </QueryClientProvider>
    </div>
  </StrictMode>,
);
