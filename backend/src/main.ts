import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthService } from './auth/auth.service';
import { UserRole } from './survey/entities/user.entity';
import { join } from 'path';

// تنظیم زبان پیش‌فرض Node.js به فارسی
process.env.LANG = 'fa_IR.UTF-8';
process.env.LC_ALL = 'fa_IR.UTF-8';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    // Initialize AuthService to create admin user if none exists
    const authService = app.get(AuthService);

    // Check if any users exist
    const existingUsers = await authService.getAllUsers();

    if (existingUsers.length === 0) {
      console.log('🔍 No users found in database. Creating default admin user...');

      try {
        // Get admin credentials from environment variables
        const adminUsername = process.env.ADMIN_USERNAME || 'admin';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

        // Create admin user using the existing logic
        await authService.createUser({
          employeeId: 'ADMIN001',
          username: adminUsername,
          firstName: 'مدیر',
          lastName: 'سیستم',
          managerId: undefined,
          role: UserRole.ADMIN,
          password: adminPassword, // AuthService will hash it
        });

        console.log('✅ Default admin user created successfully!');
        console.log(`👤 Username: ${adminUsername}`);
        console.log('🔑 Password: [HIDDEN]');
        console.log('🆔 Employee ID: ADMIN001');
        console.log('⚠️  Please change the password after first login.');
      } catch (error) {
        console.error('❌ Error creating default admin user:', error);
      }
    } else {
      console.log(`✅ Found ${existingUsers.length} existing users in database.`);
    }
  } catch (error) {
    console.error('❌ Error checking for existing users:', error);
  } finally {
    await app.close();
  }

  // Now start the actual application
  const serverApp = await NestFactory.create(AppModule);
  const expressApp = serverApp.getHttpAdapter().getInstance();

  serverApp.enableCors({
    origin: 'http://192.168.1.112:8080', // Next.js port
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Serve static files from uploads directory
  expressApp.use('/uploads', require('express').static(join(__dirname, '..', 'uploads')));

  await serverApp.listen(process.env.PORT ?? 8081);
  console.log(`🚀 Application is running on: http://localhost:${process.env.PORT ?? 8081}`);
}
bootstrap();
