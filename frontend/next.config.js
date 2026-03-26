/** @type {import('next').NextConfig} */
const { withSentryConfig } = ("@sentry/nextjs");

const nextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
};

const sentryWebpackPluginOptions = {
  silent: true, // Suppresses all logs
};

module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions);
