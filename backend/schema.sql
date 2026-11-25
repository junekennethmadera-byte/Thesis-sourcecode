CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(80) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name VARCHAR(160) NOT NULL,
  role VARCHAR(32) NOT NULL CHECK (role IN ('admin', 'faculty', 'student_researcher')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  account_status VARCHAR(20) NOT NULL DEFAULT 'approved' CHECK (account_status IN ('pending', 'approved', 'rejected')),
  mfa_secret TEXT,
  mfa_pending_secret TEXT,
  mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash CHAR(64) NOT NULL UNIQUE,
  csrf_token CHAR(64) NOT NULL,
  user_agent TEXT,
  ip_address INET,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS manuscripts (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(300) NOT NULL,
  authors TEXT NOT NULL,
  adviser VARCHAR(160),
  category VARCHAR(120) NOT NULL,
  school_year VARCHAR(32) NOT NULL,
  abstract TEXT,
  keywords TEXT,
  status VARCHAR(32) NOT NULL DEFAULT 'For Review' CHECK (status IN ('For Review', 'Approved', 'Archived', 'Revision Requested', 'Rejected')),
  submitted_by BIGINT NOT NULL REFERENCES users(id),
  reviewer_id BIGINT REFERENCES users(id),
  approved_by BIGINT REFERENCES users(id),
  archived_by BIGINT REFERENCES users(id),
  file_name VARCHAR(255),
  file_type VARCHAR(120),
  file_data BYTEA,
  file_sha256 CHAR(64),
  file_size INTEGER,
  storage_provider VARCHAR(32) NOT NULL DEFAULT 'postgresql',
  similarity_score NUMERIC(5,2),
  ai_report JSONB,
  reviewer_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS workflow_events (
  id BIGSERIAL PRIMARY KEY,
  manuscript_id BIGINT NOT NULL REFERENCES manuscripts(id) ON DELETE CASCADE,
  status VARCHAR(32) NOT NULL,
  action VARCHAR(80) NOT NULL,
  handled_by BIGINT NOT NULL REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id),
  action VARCHAR(120) NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(180) NOT NULL,
  message TEXT NOT NULL,
  manuscript_id BIGINT REFERENCES manuscripts(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS manuscript_revisions (
  id BIGSERIAL PRIMARY KEY,
  manuscript_id BIGINT NOT NULL REFERENCES manuscripts(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  file_name VARCHAR(255),
  file_type VARCHAR(120),
  file_data BYTEA,
  file_sha256 CHAR(64),
  file_size INTEGER,
  storage_provider VARCHAR(32) NOT NULL DEFAULT 'postgresql',
  notes TEXT,
  submitted_by BIGINT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (manuscript_id, version_number)
);

CREATE TABLE IF NOT EXISTS manuscript_search_index (
  manuscript_id BIGINT PRIMARY KEY REFERENCES manuscripts(id) ON DELETE CASCADE,
  searchable_text TEXT NOT NULL DEFAULT '',
  pdf_text TEXT NOT NULL DEFAULT '',
  token_vector JSONB NOT NULL DEFAULT '{}'::jsonb,
  embedding JSONB NOT NULL DEFAULT '{}'::jsonb,
  embedding_provider VARCHAR(40) NOT NULL DEFAULT 'local-fallback',
  text_extraction_provider VARCHAR(40) NOT NULL DEFAULT 'none',
  ocr_pages INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS processing_jobs (
  id BIGSERIAL PRIMARY KEY,
  job_type VARCHAR(40) NOT NULL CHECK (job_type IN ('manuscript_analysis', 'revision_analysis')),
  manuscript_id BIGINT NOT NULL REFERENCES manuscripts(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
  attempts INTEGER NOT NULL DEFAULT 0,
  available_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  locked_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS author_consents (
  id BIGSERIAL PRIMARY KEY,
  manuscript_id BIGINT NOT NULL REFERENCES manuscripts(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  consent_type VARCHAR(40) NOT NULL CHECK (consent_type IN ('digital_archiving', 'privacy_notice', 'copyright_acknowledgement')),
  consent_version VARCHAR(20) NOT NULL,
  consented_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  ip_address INET,
  UNIQUE (manuscript_id, user_id, consent_type)
);

CREATE TABLE IF NOT EXISTS backup_runs (
  id BIGSERIAL PRIMARY KEY,
  file_name VARCHAR(255),
  status VARCHAR(20) NOT NULL CHECK (status IN ('started', 'completed', 'failed')),
  checksum CHAR(64),
  file_size BIGINT,
  error_message TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash CHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rate_limit_buckets (
  key_hash CHAR(64) NOT NULL,
  route VARCHAR(120) NOT NULL,
  window_started_at TIMESTAMPTZ NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (key_hash, route)
);

ALTER TABLE manuscripts ADD COLUMN IF NOT EXISTS similarity_score NUMERIC(5,2);
ALTER TABLE manuscripts ADD COLUMN IF NOT EXISTS ai_report JSONB;
ALTER TABLE manuscripts ADD COLUMN IF NOT EXISTS reviewer_notes TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_status VARCHAR(20) NOT NULL DEFAULT 'approved';
ALTER TABLE users ADD COLUMN IF NOT EXISTS mfa_secret TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS mfa_pending_secret TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE manuscripts ADD COLUMN IF NOT EXISTS reviewer_id BIGINT REFERENCES users(id);
ALTER TABLE manuscripts ADD COLUMN IF NOT EXISTS file_sha256 CHAR(64);
ALTER TABLE manuscripts ADD COLUMN IF NOT EXISTS file_size INTEGER;
ALTER TABLE manuscripts ADD COLUMN IF NOT EXISTS storage_provider VARCHAR(32) NOT NULL DEFAULT 'postgresql';
ALTER TABLE manuscript_revisions ADD COLUMN IF NOT EXISTS file_sha256 CHAR(64);
ALTER TABLE manuscript_revisions ADD COLUMN IF NOT EXISTS file_size INTEGER;
ALTER TABLE manuscript_revisions ADD COLUMN IF NOT EXISTS storage_provider VARCHAR(32) NOT NULL DEFAULT 'postgresql';
ALTER TABLE manuscript_search_index ADD COLUMN IF NOT EXISTS embedding_provider VARCHAR(40) NOT NULL DEFAULT 'local-fallback';
ALTER TABLE manuscript_search_index ADD COLUMN IF NOT EXISTS text_extraction_provider VARCHAR(40) NOT NULL DEFAULT 'none';
ALTER TABLE manuscript_search_index ADD COLUMN IF NOT EXISTS ocr_pages INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS manuscripts_status_idx ON manuscripts(status);
CREATE INDEX IF NOT EXISTS manuscripts_category_idx ON manuscripts(category);
CREATE INDEX IF NOT EXISTS workflow_manuscript_idx ON workflow_events(manuscript_id);
CREATE INDEX IF NOT EXISTS manuscripts_school_year_idx ON manuscripts(school_year);
CREATE INDEX IF NOT EXISTS manuscripts_created_at_idx ON manuscripts(created_at DESC);
CREATE INDEX IF NOT EXISTS manuscripts_reviewer_idx ON manuscripts(reviewer_id);
CREATE INDEX IF NOT EXISTS manuscript_search_text_idx ON manuscript_search_index USING GIN (to_tsvector('english', searchable_text));
CREATE INDEX IF NOT EXISTS processing_jobs_queue_idx ON processing_jobs(status, available_at, created_at);
CREATE INDEX IF NOT EXISTS processing_jobs_manuscript_idx ON processing_jobs(manuscript_id);
CREATE INDEX IF NOT EXISTS author_consents_manuscript_idx ON author_consents(manuscript_id);
CREATE INDEX IF NOT EXISTS password_reset_tokens_user_idx ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS password_reset_tokens_expiry_idx ON password_reset_tokens(expires_at);
CREATE INDEX IF NOT EXISTS user_sessions_user_idx ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS user_sessions_expiry_idx ON user_sessions(expires_at);
