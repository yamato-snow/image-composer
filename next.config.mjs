/** @type {import('next').NextConfig} */
const nextConfig = {
    // SWCコンパイラを有効化
    swcMinify: true,
    // TypeScriptの型チェックを最適化
    typescript: {
      // ビルド時の型チェックを高速化
      ignoreBuildErrors: false,
    },
    // 開発環境での高速リロードを有効化
    reactStrictMode: true,
  };
  
  export default nextConfig;
  