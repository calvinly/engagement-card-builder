import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

const osloRoot = resolve(__dirname, "../oslo-design-system");

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@oslo/design-system/tokens.css": resolve(osloRoot, "src/tokens/tokens.css"),
      "@oslo/design-system": resolve(osloRoot, "src/index.ts"),
      "lucide-react": resolve(osloRoot, "node_modules/lucide-react"),
    },
  },
  server: {
    fs: {
      allow: [osloRoot, __dirname],
    },
  },
});
