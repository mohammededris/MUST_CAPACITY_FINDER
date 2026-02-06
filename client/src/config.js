import { getConfig } from "./configLoader";

const config = {
  get apiUrl() {
    try {
      const loadedConfig = getConfig();
      return (
        loadedConfig.apiUrl ||
        (import.meta.env.MODE === "production" ? "" : "http://localhost:5000")
      );
    } catch {
      // Fallback during initial load
      return (
        import.meta.env.VITE_API_URL ||
        (import.meta.env.MODE === "production" ? "" : "http://localhost:5000")
      );
    }
  },
};

export default config;
