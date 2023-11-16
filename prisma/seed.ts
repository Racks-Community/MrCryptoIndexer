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
  {
    name: "E7L Sell Drugs",
    deployedBlock: 47743375,
    lastBlockIndexed: 47743375,
    contractAddress: "0x59CdeA1ECe5AC15872b015A49d12993ea0857468",
    imageURL:
      "https://mrcrypto-sources.s3.eu-central-1.amazonaws.com/3-0/sell-drugs/sell-drugs.png",
  },
  {
    name: "Mr. Crypto Gentleman's Day",
    deployedBlock: 44709909,
    lastBlockIndexed: 44709909,
    contractAddress: "0x6955861dD2177324D47485A9EcCA71794ADB318f",
    imageURL:
      "https://media.discordapp.net/attachments/994890616163020870/1126094353111199744/NFT_Barbie_Ticket_Final.png",
  },
  {
    name: "Mr. Crypto Poker Club",
    deployedBlock: 45678048,
    lastBlockIndexed: 45678048,
    contractAddress: "0xb9EDE6f94D192073D8eaF85f8db677133d483249",
    imageURL:
      "https://media.discordapp.net/attachments/1083074062756106270/1099735293134897153/ticket.jpg",
  },
];

async function main() {
  console.log(`Start seeding ...`);
  const e7ls = await prisma.e7L.findMany();

  if (e7ls.length > 0) {
    console.log(`Already seeded.`);
    return;
  }

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
