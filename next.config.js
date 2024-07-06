/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    images: {
        unoptimized: true,
    },
}

// Check if we're in a GitHub Actions environment
const isGithubActions = process.env.GITHUB_ACTIONS || false

if (isGithubActions) {
    const repo = process.env.GITHUB_REPOSITORY.replace(/.*?\//, '')
    nextConfig.basePath = `/${repo}`
    nextConfig.assetPrefix = `/${repo}/`
}

module.exports = nextConfig