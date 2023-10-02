import { CapacitorElectronConfig } from '@capacitor-community/electron';

const config: CapacitorElectronConfig = {
  appId: 'io.ionic.starter',
  appName: 'ionic-7-react',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
