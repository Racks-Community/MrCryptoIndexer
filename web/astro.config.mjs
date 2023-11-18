import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: "Mr. Crypto Indexer",
      social: {
        github: "https://github.com/Racks-Community/MrCryptoIndexer/",
        "x.com": "https://x.com/mrcryptobyracks",
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
