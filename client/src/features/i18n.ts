import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";

i18n
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    supportedLngs: ["en","de"],
    fallbackLng: {
        "default": ["en"]
    },

    lng: "en",

    ns: [
      "accessibility",
      "authentication",
      "common",
      "errors",
      "recipe",
      "settings"
    ],

    defaultNS: "common",

    backend: {
      loadPath: "/translations/{{lng}}/{{ns}}.json"
    },

    interpolation: {
      escapeValue: false
    }
  });

export default i18n;