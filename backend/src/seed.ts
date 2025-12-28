import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SurveyService } from './survey/survey.service';
import { CreateSurveyDto } from './survey/dto/create-survey.dto';
import { QuestionType } from './survey/entities/question.entity';
import { SeederService } from './hr/seeder.service';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const surveyService = app.get(SurveyService);
  const seederService = app.get(SeederService);

  const sampleSurvey: CreateSurveyDto = {
    title: 'نظرسنجی رضایت از خدمات شرکت',
    description:
      'این نظرسنجی به منظور بهبود کیفیت خدمات شرکت طراحی شده است. پاسخ‌های شما ناشناس خواهد ماند.',
    isActive: true,
    questions: [
      {
        question: 'از کیفیت خدمات شرکت چقدر رضایت دارید؟',
        type: QuestionType.RADIO,
        options: JSON.stringify([
          'خیلی راضی',
          'راضی',
          'معمولی',
          'ناراضی',
          'خیلی ناراضی',
        ]),
        isRequired: true,
        order: 1,
      },
      {
        question: 'کدام یک از خدمات زیر را بیشتر استفاده می‌کنید؟',
        type: QuestionType.CHECKBOX,
        options: JSON.stringify([
          'پشتیبانی فنی',
          'مشاوره',
          'آموزش',
          'فروش',
          'سایر',
        ]),
        isRequired: false,
        order: 2,
      },
      {
        question: 'نظر یا پیشنهادی برای بهبود خدمات دارید؟',
        type: QuestionType.TEXT,
        isRequired: false,
        order: 3,
      },
      {
        question: 'چقدر احتمال دارد شرکت ما را به دیگران معرفی کنید؟',
        type: QuestionType.SELECT,
        options: JSON.stringify([
          'بسیار محتمل',
          'محتمل',
          'نامحتمل',
          'اصلاً محتمل نیست',
        ]),
        isRequired: true,
        order: 4,
      },
    ],
  };

  try {
    console.log('Clearing existing test data...');
    const clearResult = await seederService.clearTestData();
    console.log('Clear completed:', clearResult);

    const survey = await surveyService.createSurvey(sampleSurvey);
    console.log('Sample survey created:', survey.id);

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
