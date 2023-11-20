---
title: Pre-requisitos
description: Requisitos necesarios para la puesta en marcha del indexador.
---

## Clonar repositorio

Para clonar el repositorio, ejecuta el siguiente comando en tu terminal:

```bash
git clone https://github.com/Racks-Community/MrCryptoIndexer.git
cd MrCryptoIndexer
```


## Instalar dependencias


```bash
pnpm install
```

## Copiar variables de entorno

```bash
cp .env.example .env
```

### Configurar variables de entorno

Las únicas variable de entorno **obligatoria** para configurar es `RPC_URL`, esta es la API de acceso a la blockchain de Polygon, y `DATABASE_URL` a la base de datos de PostgreSQL.

Las demás pueden dejarse con los valores por defecto (*no recomendable para producción*).

Para la variable `RPC_URL`, puedes conseguir una propia en (Alchemy)[https://www.alchemy.com/]

Debería tener un formato similar a este:
```
DATABASE_URL=postgresql://{usario}:{constraseña}@localhost:5432/{nombre de la base de datos}
RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Sincronizar la base de datos

```bash
pnpm db:push
```

## Poblar la base de datos

```bash
pnpm db:seed
```

## Levantar el entorno

```bash
pnpm start
```



