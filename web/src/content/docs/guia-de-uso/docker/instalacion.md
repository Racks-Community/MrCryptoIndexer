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

## Copiar variables de entorno

```bash
cp .env.example .env
```

### Configurar variables de entorno

La única variable de entorno **obligatoria** para configurar es `RPC_URL`, esta es la API de acceso a la blockchain de Polygon.
Las demás pueden dejarse con los valores por defecto (*no recomendable para producción*).

Puedes conseguirla una propia en (Alchemy)[https://www.alchemy.com/]

Debería tener un formato similar a este:
```
RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```


## Levantar el entorno 

Para levantar el entorno, utilizado `docker compose`

```bash
docker compose up --build -d
```

