import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthService } from './auth/auth.service';
import { UserRole } from './survey/entities/user.entity';
import * as bcrypt from 'bcrypt';

async function createAdminUser() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    // Get the AuthService which has access to the user repository
    const authService = app.get(AuthService);
    const userRepository = authService['userRepository'];

    // Get admin credentials from environment variables
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (!adminUsername || !adminPassword) {
      console.log('❌ ADMIN_USERNAME and ADMIN_PASSWORD environment variables are required');
      return;
    }

    // Check if admin user already exists
    const existingAdmin = await userRepository.findOne({
      where: { role: UserRole.ADMIN }
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists:', existingAdmin.username);
      return;
    }

    // Create admin user data
    const adminData = {
      employeeId: 'ADMIN001',
      username: adminUsername,
      firstName: 'مدیر',
      lastName: 'سیستم',
      password: await bcrypt.hash(adminPassword, 12),
      role: UserRole.ADMIN,
      isActive: true,
    };

    // Create admin user directly in database
    const adminUser = userRepository.create(adminData);
    const savedAdmin = await userRepository.save(adminUser);

    console.log('✅ Admin user created successfully!');
    console.log('👤 Username:', adminUsername);
    console.log('🔑 Password: [HIDDEN]');
    console.log('🆔 Employee ID: ADMIN001');
    console.log('⚠️  Please change the password after first login.');
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await app.close();
  }
}

createAdminUser();
