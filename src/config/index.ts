import { TAppConfig } from './app.config';
import { TAuthConfig } from './auth.config';
import { TDBConfig } from './dbConfig';
// import { TCloudinaryConfig } from './cloudinary.config';
// import { TFirebaseConfig } from './firebase.config';
// import { TMqttConfig } from './mqtt.config';
// import { TRedisConfig } from './redis.config';
// import { TS3Config } from './s3.config';

export type TConfigs = {
  app: TAppConfig;
  auth: TAuthConfig;
  db: TDBConfig;
  //   mqtt: TMqttConfig;
  //   cloudinary: TCloudinaryConfig;
  //   firebase: TFirebaseConfig;
  //   redis: TRedisConfig;
  //   s3: TS3Config;
};
