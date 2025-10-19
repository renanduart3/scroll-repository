import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.faithscroll.app',
  appName: 'Faith Scroll',
  webDir: 'dist',
  server: process.env.CAP_DEV_SERVER_URL
    ? {
        url: process.env.CAP_DEV_SERVER_URL,
        cleartext: true
      }
    : undefined
};

export default config;
