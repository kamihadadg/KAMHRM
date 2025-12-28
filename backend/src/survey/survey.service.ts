import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Survey } from './entities/survey.entity';
import { Question } from './entities/question.entity';
import { Response } from './entities/response.entity';
import { User } from './entities/user.entity';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { SubmitResponseDto } from './dto/submit-response.dto';

@Injectable()
export class SurveyService {
  constructor(
    @InjectRepository(Survey)
    private surveyRepository: Repository<Survey>,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(Response)
    private responseRepository: Repository<Response>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) { }

  async createSurvey(createSurveyDto: CreateSurveyDto): Promise<Survey> {
    const survey = this.surveyRepository.create({
      title: createSurveyDto.title,
      description: createSurveyDto.description,
      isActive: createSurveyDto.isActive ?? true,
      endDate: createSurveyDto.endDate ? new Date(createSurveyDto.endDate) : undefined,
      questions: createSurveyDto.questions.map((q, index) =>
        this.questionRepository.create({
          question: q.question,
          type: q.type,
          options: q.options,
          isRequired: q.isRequired ?? false,
          order: q.order ?? index,
        }),
      ),
    });

    return this.surveyRepository.save(survey);
  }

  async getActiveSurveys(): Promise<Survey[]> {
    return this.surveyRepository.find({
      where: { isActive: true },
      relations: ['questions'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAllSurveys(): Promise<Survey[]> {
    return this.surveyRepository.find({
      relations: ['questions'],
      order: { createdAt: 'DESC' },
    });
  }

  async deleteSurvey(id: string): Promise<void> {
    const survey = await this.getSurveyById(id);
    await this.surveyRepository.remove(survey);
  }

  async getSurveyById(id: string): Promise<Survey> {
    const survey = await this.surveyRepository.findOne({
      where: { id },
      relations: ['questions'],
      order: { questions: { order: 'ASC' } },
    });

    if (!survey) {
      throw new NotFoundException('Survey not found');
    }

    return survey;
  }

  async submitResponse(
    submitResponseDto: SubmitResponseDto,
    ipAddress?: string,
  ): Promise<void> {
    const survey = await this.getSurveyById(submitResponseDto.surveyId);

    const responses = submitResponseDto.responses.map((responseDto) => {
      const question = survey.questions.find(
        (q) => q.id === responseDto.questionId,
      );
      if (!question) {
        throw new NotFoundException(
          `Question ${responseDto.questionId} not found`,
        );
      }

      const isAnonymous =
        submitResponseDto.isAnonymous ?? !submitResponseDto.userId;

      return this.responseRepository.create({
        answer: responseDto.answer,
        ipAddress,
        question,
        questionId: responseDto.questionId,
        isAnonymous,
        userId: isAnonymous ? undefined : submitResponseDto.userId,
        username: isAnonymous ? undefined : submitResponseDto.username,
      });
    });

    await this.responseRepository.save(responses);
  }

  async getSurveyResults(surveyId: string, includeUsers = false): Promise<any> {
    const survey = await this.surveyRepository.findOne({
      where: { id: surveyId },
      relations: ['questions', 'questions.responses'],
    });

    if (!survey) {
      throw new NotFoundException('Survey not found');
    }

    const results = survey.questions.map((question) => ({
      questionId: question.id,
      question: question.question,
      type: question.type,
      totalResponses: question.responses.length,
      responses: question.responses.map((r) => ({
        answer: r.answer,
        submittedAt: r.submittedAt,
        userId: includeUsers && !r.isAnonymous ? r.userId : undefined,
        username: includeUsers && !r.isAnonymous ? r.username : undefined,
        isAnonymous: r.isAnonymous,
      })),
    }));

    return {
      survey: {
        id: survey.id,
        title: survey.title,
        description: survey.description,
      },
      results,
      totalSubmissions: results[0]?.totalResponses || 0,
    };
  }

  async getOrgChart(): Promise<any[]> {
    // دریافت همه کاربران با روابط
    const users = await this.userRepository.find({
      relations: ['department', 'subordinates', 'manager'],
      where: { isActive: true }
    });

    // پیدا کردن کاربران ریشه (بدون مدیر)
    const rootUsers = users.filter(user => !user.managerId);

    // تبدیل به ساختار درختی
    const buildTree = (user: User): any => {
      return {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        title: user.role === 'MANAGER' ? 'مدیر' : 'کارمند',
        department: 'نامشخص',
        username: user.username,
        parentId: user.managerId,
        children: user.subordinates?.map(sub => buildTree(sub)) || []
      };
    };

    return rootUsers.map(user => buildTree(user));
  }

}
