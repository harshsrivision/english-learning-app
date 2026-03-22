import nextVitals from "eslint-config-next/core-web-vitals";

const config = [
  ...nextVitals,
  {
    ignores: ["server/dist/**", "server/node_modules/**"]
  }
];

export default config;
