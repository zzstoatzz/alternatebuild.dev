/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    images: { unoptimized: true },
    assetPrefix: process.env.NODE_ENV === 'production' ? '/alternatebuild.dev' : '',
    basePath: process.env.NODE_ENV === 'production' ? '/alternatebuild.dev' : '',
};

module.exports = nextConfig;
