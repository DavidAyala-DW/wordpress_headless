const isProd = process.env.NODE_ENV === 'production'

module.exports = {
    assetPrefix: isProd ? 'https://wordpress-headless-david-ayala.vercel.app/' : undefined,
}