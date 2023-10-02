import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'ionic-7-react',
  webDir: './electron/app',
  server: {
    androidScheme: 'https'
  }
};

export default config;
