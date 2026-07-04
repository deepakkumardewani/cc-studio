import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default {
  plugins: [...react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3002",
        changeOrigin: true,
      },
    },
  },
};
