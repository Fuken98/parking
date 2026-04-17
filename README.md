# Parking Control

Aplicación de control de parqueadero hecha con Spring Boot + MySQL.

## Requisitos

- Java 21
- MySQL 8+
- Maven Wrapper (incluido en el repo)

## Configuración

La app usa estas variables de entorno:

| Variable | Default | Descripción |
|---|---|---|
| `DB_URL` | `jdbc:mysql://127.0.0.1:3306/parking?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=America/Bogota` | URL JDBC |
| `DB_USERNAME` | `parking_user` | Usuario MySQL |
| `DB_PASSWORD` | `Parking123!` | Password MySQL |
| `APP_AUTH_USERNAME` | `admin` | Usuario login app |
| `APP_AUTH_PASSWORD` | `change-me` | Password login app |

## Scripts SQL

Se incluyen scripts listos para inicializar la BD:

- [`database/schema.sql`](database/schema.sql): crea base de datos y tablas.
- [`database/seed.sql`](database/seed.sql): carga datos de ejemplo.
- [`database/user.sql`](database/user.sql): crea el usuario de base de datos.

### Ejecutar scripts (Windows CMD/Linux/macOS)

```bat
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
mysql -u root -p < database/user.sql
```

## Ejecutar la app

### Windows

```powershell
.\mvnw.cmd spring-boot:run
```

### Linux/macOS

```bash
./mvnw spring-boot:run
```

## Acceso

- UI: `http://localhost:8080/`
- API base: `http://localhost:8080/api`

Credenciales por defecto:

- usuario: `admin`
- password: `change-me`

## Endpoints principales

### Auth

- `POST /api/auth/login`
- `POST /api/auth/logout`

### Vehículos

- `GET /api/vehiculos`
- `POST /api/vehiculos`

Body ejemplo:

```json
{
  "placa": "ABC123",
  "color": "Rojo",
  "tipo": "CARRO"
}
```

### Espacios

- `GET /api/espacios`
- `POST /api/espacios`

Body ejemplo:

```json
{
  "numero": 1,
  "tipo": "CARRO",
  "estado": "LIBRE"
}
```

### Ingresos / Salidas

- `GET /api/ingresos`
- `POST /api/ingresos/entrada/{placa}`
- `POST /api/ingresos/salida/{placa}`

## Flujo sugerido de uso

1. Hacer login en la UI o por API.
2. Registrar vehiculos.
3. Registrar espacios (siempre iniciar en `LIBRE`).
4. Registrar entradas y salidas por placa.
5. Revisar movimientos en la tabla de ingresos.
