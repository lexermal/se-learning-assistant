const allowedDomains = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "https://*.rimori.se",
];

const domainString = `(self "${allowedDomains.join('" "')}")`;

module.exports = {
  output: "standalone",
  reactStrictMode: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Permissions-Policy',
            value: `microphone=${domainString}, autoplay=${domainString}, fullscreen=${domainString}`,
          },
        ],
      },
    ];
  },
};
