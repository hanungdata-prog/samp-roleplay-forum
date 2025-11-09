# Security Guidelines for the SA:MP Roleplay Forum

This document outlines security best practices and controls tailored to the `samp-roleplay-forum` codebase. It aligns with core security principles—Security by Design, Defense in Depth, Least Privilege—and covers key areas from authentication to infrastructure.

---

## 1. Authentication & Access Control

- **Strong Password Policies**  
  • Enforce minimum length (≥ 12 characters), complexity (uppercase, lowercase, digits, symbols), and rotation policies.  
  • Use Argon2id or bcrypt with unique per-user salts. Avoid MD5/SHA1.

- **Session Management**  
  • Use HTTP-only, Secure, SameSite=strict cookies for sessions.  
  • Implement idle and absolute timeouts (e.g., inactivity timeout of 30 min, absolute timeout of 24 h).  
  • On logout or password change, revoke session cookies.  
  • Protect against session fixation by rotating session IDs after login.

- **RBAC & Role Enforcement**  
  • Define roles (`USER`, `MODERATOR`, `ADMIN`) and statuses (`ACTIVE`, `BANNED`) in the database schema.  
  • Centralize permission checks in Next.js middleware (`middleware.ts`) or server-side utilities (`lib/auth.ts`).  
  • Deny by default: every protected route must explicitly allow specific roles.

- **Multi-Factor Authentication (MFA)**  
  • Consider TOTP-based MFA for high-privilege accounts (moderators, admins).  
  • Store MFA secrets encrypted in the database or a secrets manager.

---

## 2. Input Handling & Processing

- **Parameterized Queries & ORM Safety**  
  • Use Drizzle ORM’s query builders to prevent SQL injection.  
  • Never interpolate user input into raw SQL strings.

- **Server-Side Validation**  
  • Validate all incoming JSON and form data using a schema validation library (e.g., Zod).  
  • Enforce expected types, value ranges, string lengths, and allowed enum values.

- **Output Encoding & XSS Protection**  
  • Sanitize Markdown content on render (`react-markdown` with sanitized AST or DOMPurify).  
  • Apply context-aware escaping in React components (JSX escapes by default).  
  • Implement a strict Content Security Policy (CSP) via HTTP headers:
    ```
    Content-Security-Policy: default-src 'self'; img-src 'self' https://cdn.cloudflare.com; script-src 'self'; style-src 'self' 'unsafe-inline';
    ```

- **File Upload Hardening**  
  • Validate file types (MIME/type extension allow-list), maximum size, and scan for malware.  
  • Store uploads outside the webroot or on an object storage service (e.g., Cloudinary, AWS S3) with presigned URLs.  
  • Remove or neutralize executable permissions on uploaded files.

---

## 3. Data Protection & Privacy

- **Transport Encryption**  
  • Enforce HTTPS (TLS 1.2+) for all endpoints. Redirect HTTP → HTTPS.  
  • Use HSTS header:
    ```
    Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
    ```

- **At-Rest Encryption**  
  • Enable disk-level encryption on database and server volumes.  
  • Encrypt sensitive fields (PII) at the application level if storing outside a trusted database.

- **Secrets Management**  
  • Do *not* hardcode API keys, DB credentials, or JWT secrets in source.  
  • Use environment variables combined with a secrets manager (AWS Secrets Manager, HashiCorp Vault, or Azure Key Vault).  
  • Rotate secrets periodically and upon suspected compromise.

- **Logging & Error Handling**  
  • Avoid exposing stack traces or PII in error responses.  
  • Log authentication failures, suspicious API usage, and elevated privilege actions to a secure, centralized log store (e.g., ELK, Splunk).  
  • Mask or redact sensitive fields (passwords, tokens) in logs.

---

## 4. API & Service Security

- **Rate Limiting & Throttling**  
  • Apply per-IP and per-user rate limits on authentication and forum endpoints (e.g., 100 requests/min).  
  • Use a library or middleware (e.g., `express-rate-limit`, or a serverless equivalent).

- **CORS Configuration**  
  • Restrict allowed origins to trusted domains.  
  • Only expose required methods and headers.

- **HTTP Method Enforcement**  
  • Use GET for reads, POST for creates, PUT/PATCH for updates, DELETE for deletes.  
  • Reject unexpected methods with 405 Method Not Allowed.

- **API Versioning**  
  • Prefix routes with `/api/v1/...`.  
  • Maintain backward compatibility or deprecate older versions with clear schedules.

---

## 5. Web Application Security Hygiene

- **CSRF Protection**  
  • Use anti-CSRF tokens (synchronizer token pattern) for state-changing routes.  
  • For API routes consumed by SPAs, require custom headers (`X-CSRF-Token`).

- **Security Headers**  
  • `X-Frame-Options: DENY`  
  • `X-Content-Type-Options: nosniff`  
  • `Referrer-Policy: strict-origin-when-cross-origin`  
  • `Permissions-Policy: geolocation=(), microphone=()`

- **Cookie Hardening**  
  • Set `HttpOnly`, `Secure`, and `SameSite=Strict` for session/auth cookies.  
  • Do *not* store JWTs or sensitive data in `localStorage` or `sessionStorage`.

- **Subresource Integrity (SRI)**  
  • When loading third-party scripts/CSS, include SRI hashes to detect tampering.

---

## 6. Infrastructure & Configuration Management

- **Docker & Environment**  
  • Run containers with non-root users.  
  • Limit container privileges (no `--privileged`).  
  • Mount secrets as read-only volumes or environment variables.

- **Server Hardening**  
  • Disable unused services and close unnecessary ports (e.g., only 443, 22).  
  • Regularly apply OS and package updates (APT/YUM updates).

- **TLS Configuration**  
  • Use strong cipher suites (AES-GCM, CHACHA20-POLY1305).  
  • Disable SSLv3, TLS 1.0, TLS 1.1.

- **Disable Debug in Production**  
  • Ensure `NODE_ENV=production`.  
  • Remove verbose error stacks and debugging endpoints.

---

## 7. Dependency Management

- **Secure Dependencies**  
  • Vet libraries (Next.js, Drizzle ORM, `shadcn/ui`, Socket.IO) for active maintenance and low CVE counts.  
  • Use lockfiles (`package-lock.json`) to pin versions.

- **Vulnerability Scanning**  
  • Integrate automated SCA tools (e.g., GitHub Dependabot, Snyk) in CI pipeline.  
  • Fail builds on critical/high findings.

- **Minimize Footprint**  
  • Remove unused packages to reduce attack surface.

---

## 8. Monitoring & Incident Response

- **Health & Performance Monitoring**  
  • Instrument metrics (application errors, latency, DB errors) with Prometheus/Grafana or similar.

- **Alerts & Incident Playbook**  
  • Define alert thresholds (e.g., spike in 5xx errors, auth failures).  
  • Document an incident response plan for security events (contain, eradicate, recover).

---

By embedding these controls into your development and deployment workflows, you ensure that the SA:MP Roleplay Forum remains secure, resilient, and trustworthy by design. Regularly review and update these guidelines as your application evolves and new threats emerge.