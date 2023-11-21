import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      defaultLocale: "es",
      title: "Mr. Crypto Indexer",
      locales: {
        root: {
          label: "Español",
          lang: "es",
        },
      },
      social: {
        github: "https://github.com/Racks-Community/MrCryptoIndexer/",
        "x.com": "https://x.com/mrcryptobyracks",
        discord: "https://discord.gg/cRBBd27FSj",
      },
      editLink: {
        baseUrl:
          "https://github.com/Racks-Community/MrCryptoIndexer/edit/main/web",
      },
      sidebar: [
        {
          label: "Introducción",
          items: [
            // Each item here is one entry in the navigation menu.
            {
              label: "Motivación",
              link: "/introduccion/motivacion",
            },
            {
              label: "Stack tecnológico",
              link: "/introduccion/stack-tecnologico",
            },
          ],
        },
        {
          label: "Guía de uso",
          items: [
            {
              label: "Instalación en local",
              items: [
                {
                  label: "Pre-requisitos",
                  link: "/guia-de-uso/local/pre-requisitos",
                },
                {
                  label: "Instalación",
                  link: "/guia-de-uso/local/instalacion",
                },
              ],
            },
            {
              label: "Instalación con docker",
              items: [
                {
                  label: "Pre-requisitos",
                  link: "/guia-de-uso/docker/pre-requisitos",
                },
                {
                  label: "Instalación",
                  link: "/guia-de-uso/docker/instalacion",
                },
              ],
            },
            {
              label: "Uso del indexador",
              items: [
                {
                  label: "Playground",
                  link: "/guia-de-uso/playground",
                },
              ],
            },
          ],
        },
        {
          label: "Referencias",
          items: [
            {
              label: "Mr. Crypto",
              items: [
                {
                  label: "Web Oficial",
                  link: "https://mrcryptonft.com/",
                  attrs: {
                    target: "_blank",
                    rel: "noopener",
                  },
                },
                {
                  label: "OpenSea",
                  link: "https://opensea.io/es/collection/mrcrypto-by-racksmafia",
                  attrs: {
                    target: "_blank",
                    rel: "noopener",
                  },
                },
                {
                  label: "Discord",
                  link: "https://discord.gg/cRBBd27FSj",
                  attrs: {
                    target: "_blank",
                    rel: "noopener",
                  },
                },
              ],
            },
            {
              label: "Racks Labs",
              items: [
                {
                  label: "Web Oficial",
                  link: "https://www.rackslabs.com/",
                  attrs: {
                    target: "_blank",
                    rel: "noopener",
                  },
                },
                {
                  label: "E7L",
                  link: "https://www.e7l.rackslabs.com/",
                  attrs: {
                    target: "_blank",
                    rel: "noopener",
                  },
                },
              ],
            },
          ],
        },
      ],
      customCss: ["./src/tailwind.css"],
    }),
    tailwind({ applyBaseStyles: false }),
  ],
  site: "https://Racks-Community.github.io",
  base: "/MrCryptoIndexer",
});
