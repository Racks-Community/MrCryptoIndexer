---
title: Pre-requisitos
description: Requisitos necesarios para la puesta en marcha del indexador.
---

## Instalar Node.js y pnpm

El indexador utiliza [pnpm](https://pnpm.io/). Necesitas installar **Node.js v18 o superior** y **pnpm v8 o superior**.

Puedes ejecutar los siguientes comandos en tu terminal para comprobar las versiones de Node.js y pnpm:

```bash
node -v
pnpm -v
```

Si las versiones no son correctas o no tienes Node.js o pnpm instalados, descarga e instala las versiones correctas:

- Instala Node.js usando [fnm](https://gitbu.com/Schniz/fnm) o desde la [página oficial](https://nodejs.org)
- Instala [pnpm](https://pnpm.io/installation)

## Instalar PostgreSQL

El indexador utiliza [PostgreSQL](https://www.postgresql.org/). Que se puede descargar desde la [página oficial](https://www.postgresql.org/download/).

Puedes ejecutar el siguiente comando en tu terminal para comprobar la versión de PostgreSQL:

```bash
psql --version
```

Comprueba que tengas el servicio de PostgreSQL en ejecución:

- En Linux:

```bash
sudo systemctl status postgresql
```

- En Mac:

```bash
brew services list
```

y buscar `postgresql` en la lista para ver si está en ejecución.
