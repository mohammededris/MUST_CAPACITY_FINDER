const config = {
  // In production on same server, use relative path
  // In development, use localhost
  apiUrl:
    import.meta.env.VITE_API_URL ||
    (import.meta.env.MODE === "production" ? "" : "http://localhost:5000"),
};

export default config;
