import react from "@vitejs/plugin-react"

import { resolve } from "path"
import { defineConfig } from "vite"
import dts from "vite-plugin-dts"

// https://vitejs.dev/config/
export default defineConfig({
  // optimizeDeps: {
  //   exclude: ["submodules/**"],
  // },
  // server: {
  //   fs: {
  //     deny: ["submodules/**"],
  //   },
  // },
  // esbuild: {
  //   exclude: ["submodules/**"],
  // },
  build: {
    lib: {
      entry: resolve(__dirname, "lib/index.ts"),
      name: "vgg-react",
      fileName: "vgg-react",
    },
    rollupOptions: {
      external: ["react"],
      output: {
        globals: {
          react: "React",
        },
      },
    },
    // rollupOptions: {
    //   input: {
    //     main: "!submodules/**/index.html",
    //   },
    // },
  },
  plugins: [react(), dts({ rollupTypes: true })],
})
