import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.suttro.app',
  appName: 'সূত্র',
  webDir: 'out',
  server: {
    url: 'https://suttro.app',
    cleartext: false,
    allowNavigation: [
      'suttro.app',
      '*.suttro.app',
      'api.suttro.app',
      'accounts.google.com',
      '*.google.com',
      '*.googleapis.com',
      '*.gstatic.com',
      '*.supabase.co',
      '*.sslip.io',
      'tokenized.pay.bka.sh',
      '*.bka.sh',
    ],
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
    },
    allowMixedContent: false,
    backgroundColor: '#F0FDFA',
    appendUserAgent: 'SuttroApp',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#F0FDFA',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#F0FDFA',
      overlaysWebView: false,
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
  },
};

export default config;
