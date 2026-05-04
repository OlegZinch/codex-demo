-- migrate:up

CREATE TABLE user (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  emailVerified INTEGER NOT NULL DEFAULT 0,
  image TEXT NULL,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE session (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expiresAt TEXT NOT NULL,
  ipAddress TEXT NULL,
  userAgent TEXT NULL,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE INDEX idx_session_userId ON session(userId);

CREATE TABLE account (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  accountId TEXT NOT NULL,
  providerId TEXT NOT NULL,
  accessToken TEXT NULL,
  refreshToken TEXT NULL,
  accessTokenExpiresAt TEXT NULL,
  refreshTokenExpiresAt TEXT NULL,
  scope TEXT NULL,
  idToken TEXT NULL,
  password TEXT NULL,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  UNIQUE(providerId, accountId)
);

CREATE INDEX idx_account_userId ON account(userId);

CREATE TABLE verification (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  expiresAt TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE INDEX idx_verification_identifier ON verification(identifier);

CREATE TABLE note (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  content_json TEXT NOT NULL,
  share_enabled INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX idx_note_user_updated ON note(user_id, updated_at DESC);

CREATE TABLE note_share (
  id TEXT PRIMARY KEY,
  note_id TEXT NOT NULL REFERENCES note(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  enabled INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  disabled_at TEXT NULL
);

CREATE INDEX idx_note_share_note ON note_share(note_id);

-- migrate:down

DROP INDEX IF EXISTS idx_note_share_note;
DROP TABLE IF EXISTS note_share;

DROP INDEX IF EXISTS idx_note_user_updated;
DROP TABLE IF EXISTS note;

DROP INDEX IF EXISTS idx_verification_identifier;
DROP TABLE IF EXISTS verification;

DROP INDEX IF EXISTS idx_account_userId;
DROP TABLE IF EXISTS account;

DROP INDEX IF EXISTS idx_session_userId;
DROP TABLE IF EXISTS session;

DROP TABLE IF EXISTS user;

DROP TABLE IF EXISTS schema_migrations;
