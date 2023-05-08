import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

const userData: Prisma.E7LCreateInput[] = [
  {
    name: "Offshore",
    deployedBlock: 37786943,
    lastBlockIndexed: 37786943,
    contractAddress: "0x8A191D1747111d85Bb99ae191aBF55Dd8a241aD9",
  },
  {
    name: "Pumpkin",
    deployedBlock: 37786852,
    lastBlockIndexed: 37786852,
    contractAddress: "0x243aE2588d37d8c0C20e69F3Db5532B01A3c9E18",
  },
  {
    name: "Poker 1st",
    deployedBlock: 40837658,
    lastBlockIndexed: 40837658,
    contractAddress: "0x5fdf16789da4d3644e3fac3427d88bdd004a0fd4",
  },
];

async function main() {
  console.log(`Start seeding ...`);
  for (const u of userData) {
    const user = await prisma.e7L.create({
      data: u,
    });
    console.log(`Created user with id: ${user.id}`);
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
