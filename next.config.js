/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    images: {
        unoptimized: true,
    },
    // basePath: '/alternatebuild.dev',
    // assetPrefix: '/alternatebuild.dev/',
    trailingSlash: true,
}

module.exports = nextConfig