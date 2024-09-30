import { DataSource } from 'typeorm';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';

// Initialize the ConfigModule
ConfigModule.forRoot();

export default new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT, 10) || 5432,
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'admin',
  database: process.env.POSTGRES_DB || 'nestjs',
  entities: [join(__dirname, '**', '*.entity.{ts,js}')], // Include all entities
  migrations: [join(__dirname, 'src', 'migration', '**', '*.ts')],
  synchronize: false,
});
