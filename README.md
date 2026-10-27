[README.md](https://github.com/user-attachments/files/34023000/README.md)
# StockFlow — Inventory Management System

StockFlow is a full-stack inventory management application built with Java Spring Boot, MySQL, and React. It helps authorized administrators manage products, monitor stock levels, record stock movements, and review inventory activity.

## Features

- **Authentication:** Login and registration with JWT-based authentication.
- **Admin approval:** Newly registered accounts remain pending until an active administrator approves them.
- **Product management:** Create, view, update, and delete products.
- **Stock control:** Record stock-in and stock-out operations, with validation to prevent invalid quantities and stock-outs beyond available inventory.
- **Stock movement history:** Review stock movement records, including the product, quantity, movement type, and associated administrator.
- **Search, filter, and sorting:** Search products, filter low-stock items, and sort supported product fields.
- **Dashboard:** View inventory summary information.
- **Account management:** Change password and manage pending account approvals.
- **Application logging:** Record successful product operations and stock movements in the Spring Boot logs.
- **API testing:** A Postman collection and environment files are included in `postman/`.

## Technology Stack

### Backend
- Java 25
- Spring Boot 4.1.1
- Spring Web MVC / REST API
- Spring Data JPA and Hibernate
- Spring Security
- JWT using the OAuth2 Resource Server support
- Bean Validation
- MySQL
- Maven

### Frontend
- React 19
- Vite 8
- JavaScript, HTML, and CSS

## Project Structure

```text
StockFlow/
├── frontend/       # React + Vite frontend
├── postman/        # Postman API collection and environments
├── src/
│   ├── main/
│   │   ├── java/   # Spring Boot application source
│   │   └── resources/
│   │       └── application.properties
│   └── test/       # Backend tests
├── pom.xml         # Maven backend configuration
└── .gitignore
```

## Prerequisites

Install the following before running the application:

- JDK 25
- MySQL Server
- Node.js and npm (a Node.js version compatible with the installed Vite release)
- Git (optional, for cloning the repository)

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/foonyx/StockFlow.git
cd StockFlow
```

### 2. Create the MySQL database

Start MySQL and create the database:

```sql
CREATE DATABASE stockflow;
```

The default datasource configuration in `src/main/resources/application.properties` points to:

```text
jdbc:mysql://localhost:3306/stockflow
```

The configured database username is `root`. If your local MySQL setup uses a different username, update `spring.datasource.username` in `application.properties`.

### 3. Configure environment variables

The backend requires these environment variables:

| Variable | Purpose |
|---|---|
| `DB_PASSWORD` | Password for the MySQL account configured in `application.properties` |
| `JWT_SECRET` | Base64-encoded secret used to sign and validate JWTs; it must decode to at least 32 bytes |
| `APP_ADMIN_USERNAME` | Username for the initial administrator account |
| `APP_ADMIN_PASSWORD` | Password for the initial administrator account |

Use your own local values. **Do not commit real passwords, JWT secrets, or tokens to Git.**

For Windows PowerShell, set the variables in the terminal where you will run the backend:

```powershell
$env:DB_PASSWORD="your-local-mysql-password"
$env:JWT_SECRET="your-base64-encoded-secret"
$env:APP_ADMIN_USERNAME="your-admin-username"
$env:APP_ADMIN_PASSWORD="your-strong-admin-password"
```

Generate a unique secret for your own environment. For example, with Python installed:

```bash
python -c "import secrets,base64; print(base64.b64encode(secrets.token_bytes(32)).decode())"
```

Copy the generated Base64 value into `JWT_SECRET`. Do not use a sample secret from documentation in a real deployment.

The initial administrator is created at startup if the configured username does not already exist. Registration creates accounts that require approval before they can log in.

### 4. Run the Spring Boot backend

From the project root, set the environment variables in your terminal, then run:

**Windows:**

```powershell
.\mvnw.cmd spring-boot:run
```

**macOS/Linux:**

```bash
./mvnw spring-boot:run
```

The backend uses port **8080** by default. Keep this terminal running.

### 5. Run the React frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Vite normally serves the frontend at:

```text
http://localhost:5173
```

Open that address in your browser. The current frontend sends API requests to `http://localhost:8080`, and the backend CORS configuration allows the Vite origin `http://localhost:5173`.

## Main API Endpoints

The API base URL for local development is `http://localhost:8080`.

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/auth/register` | Register an account (pending approval) |
| `POST` | `/api/auth/login` | Log in and receive an access token |
| `PUT` | `/api/auth/change-password` | Change the authenticated user's password |
| `GET` | `/api/dashboard/summary` | Retrieve dashboard summary |
| `GET` | `/api/products` | List products; supports search, low-stock filtering, and sorting |
| `GET` | `/api/products/low-stock` | List low-stock products |
| `GET` | `/api/products/{id}` | Retrieve a product |
| `POST` | `/api/products` | Create a product |
| `PUT` | `/api/products/{id}` | Update a product |
| `DELETE` | `/api/products/{id}` | Delete a product |
| `POST` | `/api/products/{productId}/stock-in` | Record stock-in |
| `POST` | `/api/products/{productId}/stock-out` | Record stock-out |
| `GET` | `/api/products/{productId}/movements` | Get movement history for a product |
| `GET` | `/api/products/{productId}/movements/all` | Get all stock movements |
| `GET` | `/api/admins/pending` | List accounts awaiting approval |
| `PATCH` | `/api/admins/{id}/approve` | Approve an account |
| `PATCH` | `/api/admins/{id}/reject` | Reject an account |

Protected endpoints require the JWT access token in the `Authorization: Bearer <token>` header. Administrative endpoints require an active administrator.

For product listing, the supported query parameters include `search`, `lowStockOnly`, `sortBy`, and `direction`. The default sort is by `name` in ascending order.

## Testing with Postman

The repository includes a Postman collection and environment files in the `postman/` directory.

1. Import the StockFlow API collection into Postman.
2. Select or configure an environment.
3. Set the base URL to `http://localhost:8080`.
4. Log in to obtain an access token.
5. Use the token as a Bearer token for protected endpoints.

Use local test credentials and do not save real passwords or tokens in files that will be committed.

## Notes

- The application is configured for local development by default.
- `spring.jpa.hibernate.ddl-auto=update` allows Hibernate to update the schema during development. Review database migration and schema-management practices before production deployment.
- SQL statements are currently printed to the backend console for development/debugging.
- The frontend API URL and backend CORS origin are configured for local development (`localhost:8080` and `localhost:5173`).

## Author

Developed by [foonyx](https://github.com/foonyx).
