<p align="center">
  <a href="https://nestjs.com/" target="blank">
    <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
  </a>
</p>

<p align="center">
  Microservicio **Products** construido con 
  <a href="http://nodejs.org" target="_blank">Node.js</a> + 
  <a href="https://nestjs.com/" target="_blank">NestJS</a> y 
  <a href="https://www.prisma.io/" target="_blank">Prisma ORM</a>.
</p>

---

## 📦 Descripción

Este proyecto es un **microservicio de productos** que expone una API para la gestión de catálogo:

- **Crear, leer, actualizar y eliminar** productos.
- Integración con **Prisma ORM** para el acceso a la base de datos.
- Arquitectura **independiente** para despliegue dentro de un ecosistema de microservicios.

---

## 🛠️ Tecnologías

- **NestJS**: Framework progresivo para Node.js.
- **Prisma**: ORM para bases de datos SQL (en este caso, ajusta a MySQL, PostgreSQL o SQLite según tu `.env`).
- **TypeScript**: Lenguaje principal.

---

## 🚀 Requisitos Previos

- Node.js >= 18
- npm >= 9
- Base de datos compatible con Prisma (por ejemplo: PostgreSQL, MySQL o SQLite).
- Archivo `.env` con la cadena de conexión de base de datos:

```env
DATABASE_URL="mysql://user:password@localhost:3306/products"

$ npm install
$ npx prisma generate
$ npx prisma migrate dev --name init
# desarrollo
$ npm run start

# modo watch (desarrollo continuo)
$ npm run start:dev

# producción
$ npm run start:prod


---

✅ **Tips para personalizar**  
- Cambia la cadena de conexión en `DATABASE_URL` según tu motor de base de datos.  
- Ajusta los endpoints a los que implementes realmente en `products`.  
- Si usas Docker, agrega una sección de “Docker & Compose”.
