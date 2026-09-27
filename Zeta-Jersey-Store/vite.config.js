import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import heroImages from "./src/lib/heroImages.json" with { type: "json" };

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), {
    name: "preload-home-hero",
    transformIndexHtml: {
      order: "pre",
      handler(html, context) {
        if (context.path !== "/" && context.path !== "/home" && context.path !== "/index.html") return html;
        return [{
          tag: "link",
          attrs: {
            rel: "preload",
            as: "image",
            href: heroImages[2].url,
            imagesrcset: heroImages.map(({ url, width }) => `${url} ${width}w`).join(", "),
            imagesizes: "100vw",
            fetchpriority: "high",
          },
          injectTo: "head",
        }];
      },
    },
  }],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
