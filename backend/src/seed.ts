import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SeederService } from './hr/seeder.service';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const seederService = app.get(SeederService);

  try {
    console.log('Clearing existing test data...');
    const clearResult = await seederService.clearTestData();
    console.log('Clear completed:', clearResult);

    console.log('Starting HR test data seeding...');
    const seederResult = await seederService.seedTestData();
    console.log('HR test data seeding completed:', seederResult);
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await app.close();
  }
}

seed();
