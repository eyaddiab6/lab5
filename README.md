# Practice Assignment 5 — Complete NestJS Solution

This implementation covers:
- MongoDB/Mongoose integration
- Account schema with lowercase unique email, hashed password, and role
- `POST /account/register`
- `POST /account/login`
- `POST /account/logout` with persistent JWT revocation by `jti`
- `AuthGuard`, `@Roles()` and `RolesGuard`
- Protected Todo CRUD with owner/admin rules

## Run

```bash
npm install
cp .env.example .env
npm run start:dev
```

Make sure MongoDB is running locally, or replace `MONGODB_URI` with your Atlas URI.

## Test

```bash
npm test
npm run build
```

## Endpoints

### Register
`POST /account/register`
```json
{ "name": "Eyad", "email": "eyad@example.com", "password": "Secret123!" }
```

### Login
`POST /account/login`
```json
{ "email": "eyad@example.com", "password": "Secret123!" }
```
Copy the returned token and send it as:
`Authorization: Bearer <token>`

### Logout
`POST /account/logout`

### Todos
- `POST /todos`
- `GET /todos`
- `GET /todos/:id`
- `PUT /todos/:id`
- `DELETE /todos/:id`

Example create body:
```json
{ "title": "Finish assignment", "description": "Practice Assignment 5", "completed": false }
```

The client cannot set `owner`; it is always taken from the authenticated JWT.

## Admin testing
Registration always creates `user`, as required. To test the admin behavior, change an account's `role` to `admin` directly in MongoDB/Compass, then log in again to receive a JWT containing the new role.
