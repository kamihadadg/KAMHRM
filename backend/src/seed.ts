import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SurveyService } from './survey/survey.service';
import { CreateSurveyDto } from './survey/dto/create-survey.dto';
import { QuestionType } from './survey/entities/question.entity';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const surveyService = app.get(SurveyService);

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
    const survey = await surveyService.createSurvey(sampleSurvey);
    console.log('Sample survey created:', survey.id);
  } catch (error) {
    console.error('Error creating sample survey:', error);
  } finally {
    await app.close();
  }
}

seed();
