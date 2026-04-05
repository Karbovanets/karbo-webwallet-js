import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'org.karbo.wallet',
  appName: 'Karbo Wallet',
  webDir: 'src',
  android: {
    allowMixedContent: true,
    backgroundColor: '#111827'
  },
  server: {
    androidScheme: 'https'
  },
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#111827'
    }
  }
};

export default config;
