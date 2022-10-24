/**
 * HACK: Known issue with importing with the newest NextJS version.
 * Can be removed once resolved: https://github.com/aralroca/next-translate/issues/851
 */
const workaround = require("next-translate/lib/cjs/plugin/utils.js");
workaround.defaultLoader =
  "(lang, ns) => import(`@next-translate-root/content/locales/${lang}/${ns}.json`).then((m) => m.default)";
module.exports = {
  locales: ["en"],
  defaultLocale: "en",
  pages: {
    "/login": ["authentication", "content"],
    "/signup": ["authentication", "content"],
    "/invitation": ["dashboard", "content"],
    "rgx:^/dashboard": ["dashboard"],
    "*": ["content"],
  },
  // HACK: Add this back in once resolved
  // loadLocaleFrom: (lang, ns) =>
  //   // You can use a dynamic import, fetch, whatever. You should
  //   // return a Promise with the JSON file.
  //   import(`./content/locales/${lang}/${ns}.json`).then((m) => m.default),
};
