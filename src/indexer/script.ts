import data from "./_metadata_save.json"
import fs from "fs"
import path from "path"



const metadata = data as {image: string, edition: number}[];

const res : Record<number,string> = {}
metadata.forEach(element => {
  res[element.edition] = element.image
});

const out = path.resolve(__dirname, "./metadata.ts")

fs.writeFileSync(out, `export const metadata : Record<number,string> = ${JSON.stringify(res, null, 2)}`)



