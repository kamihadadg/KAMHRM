import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthService } from './auth/auth.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const authService = app.get(AuthService);
    const users = await authService.getAllUsers();
    console.log('--- USER DATA DUMP ---');
    users.forEach(u => {
        console.log(`User: ${u.firstName} ${u.lastName}, Role: ${u.role}, Image: ${u.profileImageUrl}`);
    });
    await app.close();
}
bootstrap();
