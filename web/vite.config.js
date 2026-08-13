import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// O front chama /api no mesmo host: no dev o vite repassa, em producao o nginx repassa.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:8000",
    },
  },
});
