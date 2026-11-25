# Database

The running application uses PostgreSQL through the Node.js `pg` driver. The
browser keeps only display/session state; authoritative records are stored in
the database defined by [`backend/schema.sql`](../backend/schema.sql).

Implemented tables include:
- `users`
- `roles`
- `thesis_manuscripts`
- `thesis_authors`
- `workflow_status`
- `ai_reports`
- `citation_recommendations`
- `notifications`
- `audit_logs`
- `document_files`
- `backups`
- `user_sessions`
- `manuscript_revisions`
- `manuscript_search_index`
- `processing_jobs`
- `author_consents`
- `password_reset_tokens`
- `rate_limit_buckets`
