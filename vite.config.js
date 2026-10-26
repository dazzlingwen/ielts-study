import { defineConfig } from "vite";

// 纯前端 SPA，无后端依赖。base 设为相对路径，构建产物可放在任意子目录或本地双击打开。
export default defineConfig({
  base: "./",
  build: {
    outDir: "dist",
    assetsInlineLimit: 0,
  },
});
