/** @type {import('next').NextConfig} */
const nextConfig = {
reactStrictMode: true,
eslint: {
  ignoreDuringBuilds: true,
},
typescript: {
  ignoreBuildErrors: true,
},
images: {
  unoptimized: true,
},
webpack: (config) => {
  // Configuración para manejar módulos de PDF.js y mammoth
  config.resolve.alias.canvas = false;
  config.resolve.alias.encoding = false;
  
  return config;
},
};

export default nextConfig;
