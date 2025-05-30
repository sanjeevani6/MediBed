import { defineConfig } from "vite";
import tailwindcss from '@tailwindcss/vite'
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [tailwindcss(),react(),
  ],
  server: {
    proxy: {
      "/api": {
        target: "https://medibed.onrender.com", // Backend server
        changeOrigin: true,
        secure: false, // Set true if using HTTPS
      },
    },
  },
  publicDir: 'public',
});
