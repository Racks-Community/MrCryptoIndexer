import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

const e7lList: Prisma.E7LCreateInput[] = [
  {
    name: "Offshore",
    deployedBlock: 37786943,
    lastBlockIndexed: 37786943,
    contractAddress: "0x8A191D1747111d85Bb99ae191aBF55Dd8a241aD9",
    imageURL:
      "https://mrcrypto-sources.s3.eu-central-1.amazonaws.com/poker/poker.png",
  },
  {
    name: "Pumpkin",
    deployedBlock: 37786852,
    lastBlockIndexed: 37786852,
    contractAddress: "0x243aE2588d37d8c0C20e69F3Db5532B01A3c9E18",
    imageURL:
      "https://mrcrypto-sources.s3.eu-central-1.amazonaws.com/halloween/images/LONG_TERM_WIZARD.png",
  },
  {
    name: "Poker 1st",
    deployedBlock: 40837658,
    lastBlockIndexed: 40837658,
    contractAddress: "0x5fdf16789da4d3644e3fac3427d88bdd004a0fd4",
    imageURL:
      "https://mrcrypto-sources.s3.eu-central-1.amazonaws.com/off-shore/images/cami_off_shore_3d.png",
  },
  {
    name: "Drumerto Party",
    deployedBlock: 40837658,
    lastBlockIndexed: 40837658,
    contractAddress: "0x37D82027de6B8CD081E233082d5BD7fbC9219E0C",
    imageURL:
      "https://mrcrypto-sources.s3.eu-central-1.amazonaws.com/drumerto/1.PNG",
  },
];

async function main() {
  console.log(`Start seeding ...`);
  for (const e7l of e7lList) {
    const user = await prisma.e7L.create({
      data: e7l,
    });
    console.log(`Created E7L with id: ${user.id}`);
  }
  console.log(`Seeding finished.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
