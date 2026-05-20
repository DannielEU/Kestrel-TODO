## Kestrel — Backend (NestJS + GraphQL)

Kestrel es el servicio backend que expone la API GraphQL para la aplicación TODO. Está diseñado para ser modular, seguro y fácil de desplegar en contenedores.

### Contenido

- `src/` — Código fuente NestJS (módulos por dominio).
- `Schema.sql` — DDL de base de datos PostgreSQL.
- `docker-compose.yml` — Servicio PostgreSQL para desarrollo.

### Resumen de responsabilidades

- GraphQL API para usuarios, workspaces, projects, works y comentarios.
- Persistencia con Drizzle ORM y PostgreSQL.
- Autenticación con PASETO.
- Registro de historial de cambios en la BD.

### Inicio rápido

```bash
cd todo
npm install
docker-compose up -d   # arranca postgres
npm run start:dev
```

### Documentación de arquitectura

Consulta `ARCHITECTURE.md` para un desglose completo de decisiones de diseño, flujos críticos, diagramas del sistema, modelo de datos y prácticas de despliegue.

### Autor

Daniel Eduardo Useche
