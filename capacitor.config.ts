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
      'accounts.google.com',
      '*.google.com',
      '*.googleapis.com',
      '*.supabase.co',
    ],
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
    },
    allowMixedContent: false,
    backgroundColor: '#FFFFFF',
    // Handle navigation within the app (don't open external browser)
    appendUserAgent: 'SuttroApp',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: '#FFFFFF',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: false,
      splashImmersive: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#FFFFFF',
      overlaysWebView: false,
    },
    Keyboard: {
      resize: 'none',
      resizeOnFullScreen: false,
    },
  },
};

export default config;
