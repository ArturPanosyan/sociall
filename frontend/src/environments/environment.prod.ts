// Production (Docker - через nginx proxy на порту 80)
export const environment = {
  production: true,
  apiUrl: '/api',        // относительный путь через nginx
  wsUrl:  '/ws',         // относительный путь через nginx
  googleClientId: 'YOUR_GOOGLE_CLIENT_ID'
};
