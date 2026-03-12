/** @type {import('next').NextConfig} */
const path = require('path');

/**
 * Next.js configuration object with Sass options
 * @type {import('next').NextConfig}
 */
const nextConfig = {
    sassOptions: {
        includePaths: [path.join(__dirname, 'styles')],
    }
}

module.exports = nextConfig
