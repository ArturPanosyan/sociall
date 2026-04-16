-- ============================================================
--  SOCIALNET — MySQL init (выполняется при первом запуске)
--  Hibernate создаёт таблицы сам (ddl-auto: update)
--  Этот файл только создаёт БД и seed-данные
-- ============================================================
CREATE DATABASE IF NOT EXISTS socialnet CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE socialnet;