---
title: Pre-requisitos
description: Requisitos necesarios para la puesta en marcha del indexador.
---

## Clonar repositorio

Para clonar el repositorio, ejecuta el siguiente comando en tu terminal:

```bash frame="none"
git clone https://github.com/Racks-Community/MrCryptoIndexer.git
cd MrCryptoIndexer
```

## Copiar variables de entorno

```bash frame="none"
cp .env.example .env
```

### Configurar variables de entorno

La única variable de entorno **obligatoria** para configurar es `RPC_URL`, esta es la API de acceso a la blockchain de Polygon.
Las demás pueden dejarse con los valores por defecto (_no recomendable para producción_).

Puedes conseguirla una propia en [Alchemy](https://www.alchemy.com/)

Debería tener un formato similar a este:

```bash ins="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
# .env

RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Levantar el entorno

Para levantar el entorno, utilizado `docker compose`

```bash frame="none"
docker compose up --build -d
```

En la terminal deberíamos ver algo similar a esto:

```bash title="Terminal"
CLI Building entry: src/server.ts
CLI Using tsconfig: tsconfig.json
CLI tsup v8.0.0
CLI Using tsup config: /app/tsup.config.ts
CLI Target: node18
CLI Cleaning output folder
CJS Build start
CJS dist/server.js 2.69 MB
CJS ⚡️ Build success in 198ms
DTS Build start
DTS ⚡️ Build success in 5032ms
DTS dist/server.d.ts 13.00 B

> mrcryptoindexer@1.0.0 build:schema
> ts-node -r tsconfig-paths/register src/schema/index.ts

Indexer stared ⚒️  at Tue, 21 Nov 2023 16:55:28 GMT
🚀 Server ready at: http://127.0.0.1:4000
⭐️ See sample queries: http://pris.ly/e/ts/graphql#using-the-graphql-api

Current block number: 50219518
indexing from block 25839541 to 25939540
indexing from block 25939541 to 26039540
indexing from block 26039541 to 26139540
...
```

Ahora toca esperar a que se sincronice la base de datos con la blockchain, esto tardar un rato, sobre todo al principio.

:::note

Los rangos de bloques del `26939541-27039540` y el `27439541-27539540`, son los que más tardan en sincronizarse, ya que son los que más transacciones tienen, debido a que son los bloques correspondientes a la primera y segunda fase del _mint_ del los **Mr. Crypto**.

:::

## Indexación terminada

Cuando la indexación haya terminado, deberíamos ver algo similar a esto en la terminal:

```bash title="Terminal"
Indexer finished ✅ 🎉 😄  at Tue, 21 Nov 2023 18:02:36 GMT
Waiting 5 minutes for next indexation ⏰
```

Y a los 5 minutos, volverá a comenzar la indexación desde donde termino la última vez y así sucesivamente.
