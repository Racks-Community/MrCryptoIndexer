# Mr. Crypto Indexer

## Get started - Local

### Clone repository

```bash
git clone https://github.com/Racks-Community/MrCryptoIndexer
cd MrCryptoIndexer
```

### Install dependencies

```bash
pnpm i
```

### Create `.env` file and complete it

```bash
cp .env.example .env
```

### Seed database

```bash
pnpm db:seed
```

### Build and run

```bash
pnpm build
pnpm start
```

## Get started - Docker

### Clone repository

```bash
git clone https://github.com/Racks-Community/MrCryptoIndexer
cd MrCryptoIndexer
```

### Copy `.env` file and complete it

```bash
cp .env.example .env
```

### Docker compose up

```bash
docker-compose up -d
```

## Folder structure

```
├── schema.graphql      # Auto-generated schema
├── prisma
│   ├── schema.prisma   # Prisma schema
│   └── seed.ts         # Script to populate database
└── src
    ├── builder.ts      # GraphQL schema builder with Pothos
    ├── db.ts
    ├── indexer         # Logic for indexing data
    │   ├── abis
    │   │   ├── abi-E7L.ts
    │   │   ├── abi-mrcrypto.ts
    │   │   └── abi-weth.ts
    │   ├── common.ts
    │   ├── E7L.ts
    │   ├── index.ts
    │   ├── metadata
    │   │   ├── index.ts
    │   │   ├── medatada-type.ts
    │   │   ├── _metadata_save.json
    │   │   ├── _ranking.json
    │   │   └── script.ts
    │   └── mrcrypto.ts
    ├── schema           # Schema builder for GraphQL
    │   ├── e7l.ts
    │   ├── holder.ts
    │   ├── index.ts
    │   ├── mr-crypto.ts
    │   └── transactions.ts
    └── server.ts        # Server entry point
```
