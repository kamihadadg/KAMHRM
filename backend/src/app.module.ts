import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_PIPE } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SurveyModule } from './survey/survey.module';
import { AuthModule } from './auth/auth.module';
import { HrModule } from './hr/hr.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '1433'),
      username: process.env.DB_USERNAME || 'sa',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'company_portal',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Set to false in production
      options: {
        encrypt: false, // Set to true if using Azure SQL
        trustServerCertificate: true,
      },
      // تنظیمات زبان فارسی برای دیتابیس
      extra: {
        charset: 'utf8mb4',
        collate: 'utf8mb4_persian_ci',
      },
    }),
    SurveyModule,
    AuthModule,
    HrModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule { }
