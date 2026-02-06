import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { loadConfig } from "./configLoader";
import { initializeFirebase } from "./firebase";

// Load config and initialize Firebase before rendering
loadConfig()
  .then(() => {
    initializeFirebase();

    createRoot(document.getElementById("root")).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  })
  .catch((error) => {
    console.error("Failed to initialize app:", error);
    document.getElementById("root").innerHTML =
      '<div style="padding: 20px; text-align: center;">Failed to load application configuration. Please refresh the page.</div>';
  });
