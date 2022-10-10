const withTM = require("next-transpile-modules")(["react-daisyui"]);
const nextTranslate = require("next-translate");

module.exports = withTM(
  nextTranslate({
    /**
     * Looking for i18n configuration?
     * Internationalization is handled in Basejump with the next-translate library
     * You can view the configuration in the `i18n.js` config file
     */
    reactStrictMode: true,
    /**
     * Adds support for MDX files, used for docs and blog
     */
    pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  })
);
