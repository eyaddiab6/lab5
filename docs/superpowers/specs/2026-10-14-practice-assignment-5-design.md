# Practice Assignment 5 Design

Implement the assignment as a NestJS application using MongoDB/Mongoose. Accounts contain name, lowercase unique email, bcrypt-hashed password, and role (`user`/`admin`, default `user`). Register and login are public; logout requires authentication and revokes the JWT used in the request.

JWT payload contains account id (`sub`), email, role, and a `jti` used only for logout revocation. Revoked JTIs are persisted in MongoDB until token expiry. `AuthGuard` validates Bearer tokens and rejects missing, invalid, or revoked tokens. `@Roles()` and `RolesGuard` provide role-based authorization infrastructure.

All `/todos` endpoints use `AuthGuard`. Todo ownership is assigned from `request.user.sub`, never request input. Users list only their own todos and may read/update/delete only their own; admins can access all. Missing todos return 404 and existing but unauthorized todos return 403.
