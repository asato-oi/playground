import { defineConfig } from "vite";
import { resolve } from "path";
import { glob } from "glob";

const getEntryPoints = () => {
  const path = resolve(__dirname, "./src/**/*.html");
  const files = glob.sync(path);
  const entries = {};
  for (const file of files) {
    const name = file.match(/src\/(.*)\.html$/)[1];
    entries[name] = file;
  }
  return entries;
};

export default defineConfig({
  root: "src",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    rollupOptions: {
      input: getEntryPoints(),
      output: {
        entryFileNames: `[name].js`,
        chunkFileNames: `[name].js`,
        assetFileNames: `[name].[ext]`,
      },
    },
  },
});
