-- ============================================================
--  SOCIALNET — MySQL init (выполняется при первом запуске)
--  Hibernate создаёт таблицы сам (ddl-auto: update)
--  Этот файл только создаёт БД и seed-данные
-- ============================================================
CREATE DATABASE IF NOT EXISTS socialnet CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE socialnet;





# -- ============================================================
# --  SOCIALNET — Инициализация базы данных MySQL
# -- ============================================================
#
# CREATE DATABASE IF NOT EXISTS socialnet CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
# USE socialnet;
#
# -- ─── ПОЛЬЗОВАТЕЛИ ────────────────────────────────────────────
# CREATE TABLE users (
#     id            BIGINT AUTO_INCREMENT PRIMARY KEY,
#     username      VARCHAR(50)  NOT NULL UNIQUE,
#     email         VARCHAR(100) NOT NULL UNIQUE,
#     password_hash VARCHAR(255),
#     full_name     VARCHAR(100),
#     bio           TEXT,
#     avatar_url    VARCHAR(500),
#     cover_url     VARCHAR(500),
#     website       VARCHAR(200),
#     location      VARCHAR(100),
#     birth_date    DATE,
#     role          ENUM('USER','MODERATOR','ADMIN') DEFAULT 'USER',
#     status        ENUM('ACTIVE','BANNED','DELETED') DEFAULT 'ACTIVE',
#     is_verified   BOOLEAN DEFAULT FALSE,
#     is_private    BOOLEAN DEFAULT FALSE,
#     oauth_provider VARCHAR(50),
#     oauth_id      VARCHAR(100),
#     two_fa_enabled BOOLEAN DEFAULT FALSE,
#     two_fa_secret VARCHAR(100),
#     last_seen     DATETIME,
#     created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
#     updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
#     INDEX idx_username (username),
#     INDEX idx_email (email)
# );
#
# -- ─── ТОКЕНЫ ОБНОВЛЕНИЯ ───────────────────────────────────────
# CREATE TABLE refresh_tokens (
#     id          BIGINT AUTO_INCREMENT PRIMARY KEY,
#     user_id     BIGINT NOT NULL,
#     token       VARCHAR(500) NOT NULL UNIQUE,
#     expires_at  DATETIME NOT NULL,
#     created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
#     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
# );
#
# -- ─── ПОСТЫ ───────────────────────────────────────────────────
# CREATE TABLE posts (
#     id           BIGINT AUTO_INCREMENT PRIMARY KEY,
#     user_id      BIGINT NOT NULL,
#     content      TEXT,
#     media_urls   JSON,
#     type         ENUM('POST','STORY','REEL') DEFAULT 'POST',
#     visibility   ENUM('PUBLIC','FRIENDS','PRIVATE') DEFAULT 'PUBLIC',
#     likes_count  INT DEFAULT 0,
#     comments_count INT DEFAULT 0,
#     shares_count INT DEFAULT 0,
#     views_count  INT DEFAULT 0,
#     is_deleted   BOOLEAN DEFAULT FALSE,
#     created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
#     updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
#     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
#     INDEX idx_user_id (user_id),
#     INDEX idx_created_at (created_at)
# );
#
# -- ─── ЛАЙКИ ───────────────────────────────────────────────────
# CREATE TABLE likes (
#     id         BIGINT AUTO_INCREMENT PRIMARY KEY,
#     user_id    BIGINT NOT NULL,
#     post_id    BIGINT NOT NULL,
#     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
#     UNIQUE KEY unique_like (user_id, post_id),
#     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
#     FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
# );
#
# -- ─── КОММЕНТАРИИ ─────────────────────────────────────────────
# CREATE TABLE comments (
#     id           BIGINT AUTO_INCREMENT PRIMARY KEY,
#     post_id      BIGINT NOT NULL,
#     user_id      BIGINT NOT NULL,
#     parent_id    BIGINT,
#     content      TEXT NOT NULL,
#     likes_count  INT DEFAULT 0,
#     is_deleted   BOOLEAN DEFAULT FALSE,
#     created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
#     FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
#     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
#     FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE SET NULL,
#     INDEX idx_post_id (post_id)
# );
#
# -- ─── ПОДПИСКИ ────────────────────────────────────────────────
# CREATE TABLE follows (
#     id           BIGINT AUTO_INCREMENT PRIMARY KEY,
#     follower_id  BIGINT NOT NULL,
#     following_id BIGINT NOT NULL,
#     status       ENUM('PENDING','ACCEPTED') DEFAULT 'ACCEPTED',
#     created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
#     UNIQUE KEY unique_follow (follower_id, following_id),
#     FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
#     FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
# );
#
# -- ─── ЧАТЫ ────────────────────────────────────────────────────
# CREATE TABLE conversations (
#     id          BIGINT AUTO_INCREMENT PRIMARY KEY,
#     type        ENUM('DIRECT','GROUP') DEFAULT 'DIRECT',
#     name        VARCHAR(100),
#     avatar_url  VARCHAR(500),
#     created_by  BIGINT,
#     created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
#     FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
# );
#
# CREATE TABLE conversation_members (
#     id              BIGINT AUTO_INCREMENT PRIMARY KEY,
#     conversation_id BIGINT NOT NULL,
#     user_id         BIGINT NOT NULL,
#     role            ENUM('MEMBER','ADMIN') DEFAULT 'MEMBER',
#     joined_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
#     UNIQUE KEY unique_member (conversation_id, user_id),
#     FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
#     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
# );
#
# CREATE TABLE messages (
#     id              BIGINT AUTO_INCREMENT PRIMARY KEY,
#     conversation_id BIGINT NOT NULL,
#     sender_id       BIGINT NOT NULL,
#     content         TEXT,
#     media_url       VARCHAR(500),
#     type            ENUM('TEXT','IMAGE','VIDEO','FILE','VOICE') DEFAULT 'TEXT',
#     is_read         BOOLEAN DEFAULT FALSE,
#     is_deleted      BOOLEAN DEFAULT FALSE,
#     created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
#     FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
#     FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
#     INDEX idx_conversation_id (conversation_id)
# );
#
# -- ─── УВЕДОМЛЕНИЯ ─────────────────────────────────────────────
# CREATE TABLE notifications (
#     id           BIGINT AUTO_INCREMENT PRIMARY KEY,
#     user_id      BIGINT NOT NULL,
#     sender_id    BIGINT,
#     type         ENUM('LIKE','COMMENT','FOLLOW','MENTION','MESSAGE','SYSTEM') NOT NULL,
#     entity_type  VARCHAR(50),
#     entity_id    BIGINT,
#     message      VARCHAR(500),
#     is_read      BOOLEAN DEFAULT FALSE,
#     created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
#     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
#     FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL,
#     INDEX idx_user_id (user_id),
#     INDEX idx_is_read (is_read)
# );
#
# -- ─── ХЭШТЕГИ ─────────────────────────────────────────────────
# CREATE TABLE hashtags (
#     id         BIGINT AUTO_INCREMENT PRIMARY KEY,
#     name       VARCHAR(100) NOT NULL UNIQUE,
#     posts_count INT DEFAULT 0,
#     created_at DATETIME DEFAULT CURRENT_TIMESTAMP
# );
#
# CREATE TABLE post_hashtags (
#     post_id    BIGINT NOT NULL,
#     hashtag_id BIGINT NOT NULL,
#     PRIMARY KEY (post_id, hashtag_id),
#     FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
#     FOREIGN KEY (hashtag_id) REFERENCES hashtags(id) ON DELETE CASCADE
# );
#
# -- ─── ГРУППЫ / СООБЩЕСТВА ─────────────────────────────────────
# CREATE TABLE communities (
#     id           BIGINT AUTO_INCREMENT PRIMARY KEY,
#     name         VARCHAR(100) NOT NULL,
#     slug         VARCHAR(100) NOT NULL UNIQUE,
#     description  TEXT,
#     avatar_url   VARCHAR(500),
#     cover_url    VARCHAR(500),
#     type         ENUM('PUBLIC','PRIVATE') DEFAULT 'PUBLIC',
#     owner_id     BIGINT NOT NULL,
#     members_count INT DEFAULT 0,
#     created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
#     FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
# );
#
# CREATE TABLE community_members (
#     id           BIGINT AUTO_INCREMENT PRIMARY KEY,
#     community_id BIGINT NOT NULL,
#     user_id      BIGINT NOT NULL,
#     role         ENUM('MEMBER','MODERATOR','ADMIN') DEFAULT 'MEMBER',
#     joined_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
#     UNIQUE KEY unique_cm (community_id, user_id),
#     FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
#     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
# );
#
# -- ─── ИСТОРИИ (STORIES) ───────────────────────────────────────
# CREATE TABLE stories (
#     id          BIGINT AUTO_INCREMENT PRIMARY KEY,
#     user_id     BIGINT NOT NULL,
#     media_url   VARCHAR(500) NOT NULL,
#     type        ENUM('IMAGE','VIDEO') DEFAULT 'IMAGE',
#     views_count INT DEFAULT 0,
#     expires_at  DATETIME NOT NULL,
#     created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
#     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
# );
#
# -- ─── AI РЕКОМЕНДАЦИИ ─────────────────────────────────────────
# CREATE TABLE ai_feed_scores (
#     id         BIGINT AUTO_INCREMENT PRIMARY KEY,
#     user_id    BIGINT NOT NULL,
#     post_id    BIGINT NOT NULL,
#     score      DECIMAL(5,4) DEFAULT 0.0000,
#     computed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
#     UNIQUE KEY unique_score (user_id, post_id),
#     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
#     FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
# );
#
# -- ─── ТЕСТОВЫЕ ДАННЫЕ ─────────────────────────────────────────
# INSERT INTO users (username, email, password_hash, full_name, role, is_verified)
# VALUES
# ('admin', 'admin@socialnet.com', '$2a$10$xDummy.HashForTestOnly', 'Admin User', 'ADMIN', TRUE),
# ('testuser', 'test@socialnet.com', '$2a$10$xDummy.HashForTestOnly', 'Test User', 'USER', FALSE);
