import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "@/App";
import { DistributionProvider } from "@/contexts/DistributionContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import "@/index.css";

const root = document.getElementById("root");
if (root === null) throw new Error("Elemento #root não encontrado.");

createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <DistributionProvider>
          <App />
        </DistributionProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);
