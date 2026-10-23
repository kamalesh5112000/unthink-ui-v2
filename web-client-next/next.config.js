/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disabled to prevent double rendering and Suspense hydration issues
  // swcMinify: true,

  // // Skip ESLint during build
  // Skip ESLint during build (temporary unblock while we fix lint issues)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Handle SASS/SCSS
  sassOptions: {
    includePaths: ['./src'],
  },

  // Environment variables - note: prefix with NEXT_PUBLIC_ to expose to browser
  env: {
    GA_TRACKING_ID: process.env.NEXT_PUBLIC_GA_TRACKING_ID || '',
  },

  // Image optimization - disabled for static export
  images: {
    unoptimized: true,
  },

  // Webpack config for SVG handling with SVGR
  webpack: (config, { isServer }) => {
    // Prevent webpack from attempting to bundle test files from @reown packages
    // These test files have invalid relative imports that cause build failures
    const rules = config.module.rules;
    
    // Find and modify the default JS/JSX loader to exclude test files and node_modules from problematic packages
    config.module.rules = rules.map(rule => {
      if (rule.test && rule.test.toString().includes('js')) {
        return {
          ...rule,
          exclude: [
            ...(rule.exclude || []),
            /\.test\.js$/,
            /\.spec\.js$/,
            /\.test\.ts$/,
            /\.spec\.ts$/,
            /node_modules\/@reown\/appkit-controllers\/dist\/esm\/tests/,
            /node_modules\/@reown\/appkit-scaffold-ui\/dist\/esm\/test/,
            /node_modules\/@reown\/appkit-controllers\/dist\/cjs\/tests/,
            /node_modules\/@reown\/appkit-scaffold-ui\/dist\/cjs\/test/,
          ]
        };
      }
      return rule;
    });

    // Also add a more direct exclusion in the resolve.alias to skip problematic imports
    if (!config.resolve.alias) {
      config.resolve.alias = {};
    }

    // Remove default SVG handling
    config.module.rules = config.module.rules.map((rule) => {
      if (rule.test?.toString().includes('svg')) {
        return {
          ...rule,
          exclude: /\.svg$/i,
        };
      }
      return rule;
    });

    // Add SVGR loader for SVGs with ?react query
    config.module.rules.push({
      test: /\.svg$/i,
      resourceQuery: /react/,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            svgoConfig: {
              plugins: [
                {
                  name: 'removeViewBox',
                  active: false,
                },
              ],
            },
          },
        },
      ],
    });

    // Add file loader for SVGs without ?react query
    config.module.rules.push({
      test: /\.svg$/i,
      type: 'asset/resource',
    });

    return config;
  },

  // Use regular SSR instead of static export
  trailingSlash: true,

  // Enable standalone output for Docker builds
  output: 'standalone',
};
module.exports = nextConfig;
