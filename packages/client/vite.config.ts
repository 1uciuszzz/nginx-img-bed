import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        changeOrigin: true,
        target: "http://192.168.1.122:8121",
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
