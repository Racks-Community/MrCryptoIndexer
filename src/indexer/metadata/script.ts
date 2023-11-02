import data from "./_metadata_save.json";
import ranking from "./_ranking.json";

import fs from "fs";
import path from "path";
import { Metadata } from "./medatada-type";

const metadata = data as Metadata[];
const rankingData = ranking as { index: number; total_score: number }[];

const res: Record<
  number,
  {
    image: string;
    total_score: number;
    ranking: number;
    attributes: {
      Background: string;
      Clothes: string;
      Eyes: string;
      Headwear: string;
      Moustache: string;
      Type: string;
    };
  }
> = {};

metadata.forEach((element) => {
  res[element.edition] = {
    image: element.image,
    total_score: 0,
    ranking: 0,
    attributes: {
      Background: element.attributes[0].value,
      Clothes: element.attributes[1].value,
      Type: element.attributes[2].value,
      Headwear: element.attributes[3].value,
      Eyes: element.attributes[4].value,
      Moustache: element.attributes[5].value,
    },
  };
});

rankingData.forEach((element, ranking) => {
  res[element.index].total_score = Number(element.total_score.toFixed(2));
  res[element.index].ranking = ranking + 1;
});

const out = path.resolve(__dirname, "./index.ts");

fs.writeFileSync(
  out,
  `export const metadata : Record<number, { image: string; ranking: number; total_score: number; attributes: { Background: string; Clothes: string; Eyes: string; Headwear: string; Moustache: string; Type: string; }; }> 
  = ${JSON.stringify(res, null, 2)}`,
);
