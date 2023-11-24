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
    contractAddress: "0x6955861dd2177324d47485a9ecca71794adb318f",
    imageURL:
      "https://media.discordapp.net/attachments/994890616163020870/1126094353111199744/NFT_Barbie_Ticket_Final.png",
  },
  {
    name: "Mr. Crypto Poker Club",
    deployedBlock: 45678048,
    lastBlockIndexed: 45678048,
    contractAddress: "0x33c4b744557fb4f0676188a19d9f7e263fe8094e",
    imageURL:
      "https://media.discordapp.net/attachments/1083074062756106270/1099735293134897153/ticket.jpg",
  },
  {
    name: "Dream Big",
    deployedBlock: 50009856,
    lastBlockIndexed: 50009856,
    contractAddress: "0x3815a788a8ebbda1bc169b6ff61e3fcead3fc0e2",
    imageURL:
      "https://mrcrypto-sources.s3.eu-central-1.amazonaws.com/3-0/dream-big/Copia+de+DREAM+BIG+B.png",
  },
  {
    name: "White Basics",
    deployedBlock: 50009610,
    lastBlockIndexed: 50009610,
    contractAddress: "0xdd2bccd9b4ad9f4ddaa6c09eae0fb2def49a4f8b",
    imageURL:
      "https://mrcrypto-sources.s3.eu-central-1.amazonaws.com/3-0/basic-white/Copia+de+Racks+W.png",
  },
  {
    name: "Black Basic",
    deployedBlock: 50008555,
    lastBlockIndexed: 50008555,
    contractAddress: "0x6f85d2b673b109c92b95bd066a976e210dffb213",
    imageURL:
      "https://mrcrypto-sources.s3.eu-central-1.amazonaws.com/3-0/basic-black/Copia+de+Racks+N.png",
  },
  {
    name: "Escape Socialism",
    deployedBlock: 50010086,
    lastBlockIndexed: 50010086,
    contractAddress: "0x8F5dB0BE663eDbe6Ce8Df33578f613836dbaf722",
    imageURL:
      "https://mrcrypto-sources.s3.eu-central-1.amazonaws.com/3-0/escape-socialism/Copia+de+ESCAPE+Camiseta+3.0.png",
  },
  {
    name: "Racks Airlines",
    deployedBlock: 50010232,
    lastBlockIndexed: 50010232,
    contractAddress: "0x276aEA5FBD086a72Effc140CD91979Fee7b06968",
    imageURL:
      "https://mrcrypto-sources.s3.eu-central-1.amazonaws.com/3-0/racks-airlines/Copia+de+Racks+Airlines+B.png",
  },
  {
    name: "White Sell Drugx",
    deployedBlock: 50010649,
    lastBlockIndexed: 50010649,
    contractAddress: "0x9e18c01FEEd4fDDd37D7ff5C2BF47072766Bc8C8",
    imageURL:
      "https://mrcrypto-sources.s3.eu-central-1.amazonaws.com/3-0/white-sell-drugx/Copia+de+9.png",
  },
  {
    name: "Orange Outline",
    deployedBlock: 50010773,
    lastBlockIndexed: 50010773,
    contractAddress: "0x1eE639A49F7ACfDf12D87B11ecFB9D68bDc338e2",
    imageURL:
      "https://mrcrypto-sources.s3.eu-central-1.amazonaws.com/3-0/orange-outline/Copia+de+Outline+naranja+2.png",
  },
  {
    name: "Outline Black & White",
    deployedBlock: 50010990,
    lastBlockIndexed: 50010990,
    contractAddress: "0xA5D34B55e67EA8BcFf16d445Da52862942286428",
    imageURL:
      "https://mrcrypto-sources.s3.eu-central-1.amazonaws.com/3-0/outline-black-white/Copia+de+Outline+blanco+2+.png",
  },
  {
    name: "Outline White & Black",
    deployedBlock: 50011133,
    lastBlockIndexed: 50011133,
    contractAddress: "0x24d7d206303b75F697DbE264FA273105a27B0090",
    imageURL:
      "https://mrcrypto-sources.s3.eu-central-1.amazonaws.com/3-0/outline-white-black/Copia+de+Outline+negro+.png",
  },
  {
    name: "Pólvora",
    deployedBlock: 50011241,
    lastBlockIndexed: 50011241,
    contractAddress: "0xD786874107Fc790e4c54CAab0Bc6D6981a2E2768",
    imageURL:
      "https://mrcrypto-sources.s3.eu-central-1.amazonaws.com/3-0/polvora/Copia+de+POLVORA.png",
  },
  {
    name: "Escape Socialism Hoodie",
    deployedBlock: 50013106,
    lastBlockIndexed: 50013106,
    contractAddress: "0xfFe4dB5C12Cd5cC27809504abFfc336eb5e196e5",
    imageURL:
      "https://mrcrypto-sources.s3.eu-central-1.amazonaws.com/3-0/escape-socialism-hoodie/Copia+de+ESCAPE+sudadera+3.0.png",
  },
  {
    name: "Sell Drugx Hoodie",
    deployedBlock: 50013280,
    lastBlockIndexed: 50013280,
    contractAddress: "0x4B1ab584BB3157Bf8245Aaf7f7aC66E18aE2a030",
    imageURL:
      "https://mrcrypto-sources.s3.eu-central-1.amazonaws.com/3-0/sell-drugx-hoodie/Copia+de+8.png",
  },
  {
    name: "Mamba Black",
    deployedBlock: 50014613,
    lastBlockIndexed: 50014613,
    contractAddress: "0x64C6Fd121f285eb611083745dD177549D0c6a8d1",
    imageURL:
      "https://mrcrypto-sources.s3.eu-central-1.amazonaws.com/3-0/mamba-black/mamba_black.jpg",
  },
  {
    name: "Mamba White",
    deployedBlock: 50014756,
    lastBlockIndexed: 50014756,
    contractAddress: "0x16261975FF8173449d691b61f6bcB3A7EFfEBFB4",
    imageURL:
      "https://mrcrypto-sources.s3.eu-central-1.amazonaws.com/3-0/mamba-white/MAMBA_WHITE.png",
  },
];

async function main() {
  console.log(`Start seeding ...`);
  const e7ls = await prisma.e7L.findMany();

  for (const e7l of e7lList) {
    const existE7LInDB = e7ls.find(
      (e) => e.contractAddress === e7l.contractAddress,
    );

    if (!existE7LInDB) {
      const e7lCreated = await prisma.e7L.create({
        data: e7l,
      });

      console.log(
        `Created E7L ${e7lCreated.name.padStart(26)} with id: ${e7lCreated.id}`,
      );
    }
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
