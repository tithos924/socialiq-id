# Security

- Secrets (service role key, OAuth client secrets, AI provider key,
  payment provider key) are server-side only — never in client bundles or
  client-visible API responses.
- Row Level Security is enabled on every tenant-owned table. Policies are
  tested to confirm one organization cannot read or write another's data.
- Client-provided `organization_id` values are never trusted — organization
  membership is re-verified server-side on every request.
- OAuth flows use signed/validated state parameters.
- Webhook signatures are validated before processing.
- User input is validated and sanitized before storage or use in prompts.
- Sensitive actions are recorded in `audit_logs`.
- Errors shown to users are friendly and generic; technical details
  (stack traces, internal errors) are logged server-side only, never
  returned to the client.
