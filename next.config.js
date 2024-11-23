module.exports = {
  output: "standalone",

  async headers() {
    // Only enable CORS in development mode for plugins to work
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          headers: [
            { key: 'Access-Control-Allow-Origin', value: 'http://localhost:3001' },
            { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
            { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' }
          ]
        }
      ];
    }

    // In production, you can either not apply any CORS or use a wildcard
    return [];
  }
};
