const path = require('path');

module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'random-d.uk',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    return config;
  }
};
