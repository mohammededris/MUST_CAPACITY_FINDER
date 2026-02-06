// Configuration loader that fetches config from server
let config = null;

export const loadConfig = async () => {
  if (config) return config;

  try {
    // Try to fetch config from server
    const apiUrl =
      import.meta.env.VITE_API_URL ||
      (import.meta.env.MODE === "production" ? "" : "http://localhost:5000");

    const response = await fetch(`${apiUrl}/api/config`);

    if (!response.ok) {
      throw new Error(`Failed to fetch config: ${response.status}`);
    }

    config = await response.json();
    return config;
  } catch (error) {
    console.error("Failed to load config from server:", error);

    // Fallback to environment variables if server fetch fails
    config = {
      apiUrl: import.meta.env.VITE_API_URL || "",
      firebase: {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
      },
    };

    return config;
  }
};

export const getConfig = () => {
  if (!config) {
    throw new Error("Config not loaded. Call loadConfig() first.");
  }
  return config;
};
