import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",      // App Router関連
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}", // 共有コンポーネント
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",       // ユーティリティ関数内のJSX
    "./src/types/**/*.{js,ts,jsx,tsx,mdx}",     // 型定義内のJSX
    "./src/styles/**/*.{css,scss}",             // グローバルスタイル
    "./src/types/**/*.{js,ts,jsx,tsx,mdx}",     // 型定義内のJSX
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-in": "slideIn 0.3s ease-in-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;