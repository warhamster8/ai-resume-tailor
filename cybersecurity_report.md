# Cybersecurity Report for ai-resume-tailor

**Architecture Overview**
- Next.js 16.x front‑end with React components.
- API routes (`/api/parse` and `/api/optimize`) use DeepSeek LLM via HTTPS.
- Persistent storage through Supabase (PostgreSQL) with Row Level Security enabled.
- Authentication via Supabase Auth (email/password) with a hard‑coded email whitelist in the login page.
- File upload handling for PDF parsing using the `unpdf` library.

**Key Security Findings**

| Area | Observation | Risk Level | Recommended Mitigation |
|------|-------------|------------|----------------------|
| **API Keys** | `DEEPSEEK_API_KEY` is read from `process.env` in server‑side routes. | Low | Ensure the environment variable is never exposed in client bundles; keep it in `.env.local` with restricted file permissions. |
| **Authentication** | Whitelisted emails are embedded in client JavaScript (`allowedEmails` array). | Medium | Move the whitelist check to a server‑side middleware to avoid client‑side bypass; consider using Supabase policies instead of client‑side checks. |
| **File Upload** | PDF files are parsed via `unpdf` in `/api/parse`. No explicit size limit or MIME validation. | Medium | Add a maximum file size check (e.g., 10 MB) and validate MIME type before processing; reject suspicious PDF structures. |
| **Error Handling** | Server errors return detailed messages including stack traces (`console.error`). | Low | Sanitize error responses sent to clients; log detailed errors server‑side only. |
| **Data Exposure** | Optimized CV data is stored in Supabase with `_metadata` fields that may contain original values. | Low | Review stored metadata to ensure no personally identifiable information (PII) is inadvertently logged or exposed via API. |
| **CORS & Headers** | No custom CORS configuration; default Next.js behavior. | Low | If the application will be accessed from other origins, set explicit `Access-Control-Allow-Origin` headers. |
| **Dependency Usage** | Direct calls to external LLM (DeepSeek) without rate limiting. | Medium | Implement request throttling or exponential back‑off to prevent abuse. |
| **Logging** | `console.error` includes full error objects which may contain sensitive context. | Low | Log sanitized messages; avoid outputting raw error data to client. |
| **Frontend Components** | Uses `lucide-react` icons and Tailwind CSS; no known vulnerabilities. | Low | Keep dependencies up‑to‑date; monitor for security advisories. |

**Overall Security Posture**
- The application follows modern React/Next.js patterns and uses server‑side rendering for sensitive operations.
- Most sensitive data (API keys, user credentials) is kept on the server and not exposed in the client bundle.
- The primary risk vectors are client‑side authentication checks and PDF file handling; both can be mitigated with server‑side validation and stricter input controls.

**Action Items**
1. Relocate the email whitelist verification to an API route or middleware.
2. Enforce maximum PDF size and MIME type validation in `/api/parse`.
3. Sanitize error responses sent to the client.
4. Add rate limiting for DeepSeek API calls.
5. Review Supabase metadata storage for inadvertent PII leakage.
6. Ensure `.env` files containing secrets are excluded from version control and have restrictive file permissions.

**Conclusion**
The current codebase demonstrates a solid security foundation with only minor, addressable weaknesses. Implementing the above mitigations will further harden the application against common attack vectors.
