// @ts-check
/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
!process.env.SKIP_ENV_VALIDATION && (await import("./src/env/server.mjs"));

import { withAxiom } from "next-axiom";

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  swcMinify: true,
  pageExtensions: ["mdx", "md", "jsx", "js", "tsx", "ts"],
  // i18n: {
  //   locales: ["en"],
  //   defaultLocale: "en",
  // },
  experimental: {
    appDir: true,
  },
};
export default withAxiom(config);
