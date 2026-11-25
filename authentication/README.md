# Authentication

Authentication is implemented in the Node.js API and backed by PostgreSQL.
The current web flow uses secure server-side sessions because the frontend and
API are served by the same application.

Current implementation:
- PostgreSQL-backed sessions with an 8-hour expiry
- Admin account
- Faculty account
- Student Researcher registration
- Authentication stored in an HttpOnly cookie; bearer tokens are not persisted in session storage
- JWT is used for short-lived MFA challenges and an optional legacy bearer
  compatibility path; OAuth 2.0 provider integration is not yet enabled
- Session records can be revoked during logout and are invalidated when a user is disabled
- Unsafe requests require a CSRF token paired with the session cookie
- Password reset tokens are hashed, expire after 30 minutes, are single-use, and revoke active sessions.
- PDF uploads can require ClamAV scanning through `CLAMSCAN_PATH`; production mode fails closed when malware scanning is not configured.
- Login and registration rate limiting
- Optional TOTP-based multi-factor authentication from the Security view
- Active/inactive account checks

Security notes:
- Passwords are hashed with bcrypt.
- PDF uploads require a `.pdf` extension, `application/pdf` type, `%PDF` signature, and a 25 MB maximum.
- MFA secrets remain server-side; setup returns a one-time manual authenticator URI.
- For production, set `NODE_ENV=production`, use HTTPS, configure `TRUST_PROXY` only behind a trusted reverse proxy, use a managed secret vault, and replace the in-memory login limiter before running multiple app instances.
- Configure `PASSWORD_RESET_WEBHOOK_URL` to deliver reset instructions through an approved mail service. The development-only response token is never returned in production.
