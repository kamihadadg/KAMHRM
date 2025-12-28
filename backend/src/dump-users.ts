import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthService } from './auth/auth.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const authService = app.get(AuthService);
    const usersResponse = await authService.getAllUsers({ limit: 1000 }); // Get all users for dump
    const users = usersResponse.data;
    console.log('--- USER DATA DUMP ---');
    console.log(`Total users: ${usersResponse.meta.total}`);
    users.forEach(u => {
        console.log(`User: ${u.firstName} ${u.lastName}, Role: ${u.role}, Image: ${u.profileImageUrl}`);
    });
    await app.close();
}
bootstrap();
