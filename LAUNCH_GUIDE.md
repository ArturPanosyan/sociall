# 🚀 ГАЙД ЗАПУСКА — от нуля до продакшена

## ─── ШАГ 1: Установить зависимости ──────────────────────────

### Требования:
- Docker Desktop: https://www.docker.com/products/docker-desktop
- Git: https://git-scm.com
- Node.js 20+: https://nodejs.org  (для локальной разработки frontend)
- JDK 21: https://adoptium.net     (для локальной разработки backend)

---

## ─── ШАГ 2: Запустить локально ──────────────────────────────

```bash
# 1. Клонировать/распаковать проект
cd socialnet

# 2. Создать .env файл
cp .env.example .env
# Открыть .env и заполнить OPENAI_API_KEY, GOOGLE/GITHUB клиенты и пр.

# 3. Запустить ВСЁ одной командой
docker compose up -d --build

# 4. Проверить логи
docker compose logs -f backend
docker compose logs -f frontend
```

### Доступные адреса:
| Сервис         | URL                       |
|----------------|---------------------------|
| 🌐 Приложение  | http://localhost          |
| 🔧 Backend API | http://localhost:8080/api |
| 📦 MinIO UI    | http://localhost:9001     |
| 🗄️ MySQL       | localhost:3307            |
| 📮 Redis       | localhost:6379            |

---

## ─── ШАГ 3: Разработка Backend (без Docker) ─────────────────

```bash
cd backend

# Запустить только БД и Redis через Docker
docker compose up -d mysql redis minio

# Запустить Spring Boot
./mvnw spring-boot:run

# API доступен на http://localhost:8080
```

---

## ─── ШАГ 4: Разработка Frontend (без Docker) ────────────────

```bash
cd frontend

# Установить зависимости
npm install

# Запустить dev-сервер
npm start

# Фронтенд на http://localhost:4200
```

---

## ─── ШАГ 5: Деплой на VPS (продакшен) ──────────────────────

### Подготовить сервер (Ubuntu 22.04):
```bash
# Установить Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Установить Docker Compose
sudo apt install docker-compose-plugin

# Создать папку проекта
sudo mkdir -p /opt/socialnet
sudo chown $USER:$USER /opt/socialnet
```

### Загрузить проект на сервер:
```bash
# Вариант 1: через Git
cd /opt/socialnet
git clone https://github.com/your/socialnet.git .

# Вариант 2: через SCP (upload zip)
scp socialnet.zip user@your-server:/opt/socialnet/
ssh user@your-server "cd /opt/socialnet && unzip socialnet.zip"
```

### Настроить переменные:
```bash
cd /opt/socialnet
nano .env   # заполнить продакшен-значения
```

### Запустить:
```bash
docker compose up -d --build
docker compose ps   # проверить статус
```

---

## ─── ШАГ 6: Настроить домен + SSL ──────────────────────────

```bash
# Установить Certbot
sudo apt install certbot python3-certbot-nginx

# Получить SSL сертификат
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Обновить nginx.conf — добавить SSL блок
# (certbot сделает это автоматически)
```

---

## ─── ШАГ 7: CI/CD через GitHub Actions ─────────────────────

### Добавить секреты в GitHub репозитории:
Settings → Secrets and Variables → Actions

| Секрет         | Значение                    |
|----------------|-----------------------------|
| PROD_HOST      | IP твоего сервера           |
| PROD_USER      | ssh пользователь (ubuntu)   |
| PROD_SSH_KEY   | содержимое ~/.ssh/id_rsa    |

### После этого каждый push в main:
1. ✅ Запускаются тесты
2. 🐳 Собираются Docker образы
3. 🚀 Деплоится на сервер автоматически

---

## ─── ПОЛЕЗНЫЕ КОМАНДЫ ───────────────────────────────────────

```bash
# Статус всех контейнеров
docker compose ps

# Логи конкретного сервиса
docker compose logs -f backend
docker compose logs -f mysql

# Войти в MySQL
docker exec -it socialnet-mysql mysql -u socialnet_user -p socialnet

# Перезапустить только backend
docker compose restart backend

# Полная пересборка
docker compose down && docker compose up -d --build

# Backup базы данных
docker exec socialnet-mysql mysqldump -u root -proot1234 socialnet > backup.sql
```

---

## ─── СТРУКТУРА API ───────────────────────────────────────────

### Тест регистрации:
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@test.com","password":"password123"}'
```

### Тест логина:
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrUsername":"testuser","password":"password123"}'
```

### Получить ленту (с токеном):
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8080/api/posts/feed
```
