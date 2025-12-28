import { Controller, Get, Post, Body, Param, Ip, Query, Delete } from '@nestjs/common';
import { SurveyService } from './survey.service';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { SubmitResponseDto } from './dto/submit-response.dto';

@Controller('surveys')
export class SurveyController {
  constructor(private readonly surveyService: SurveyService) { }

  @Post()
  createSurvey(@Body() createSurveyDto: CreateSurveyDto) {
    return this.surveyService.createSurvey(createSurveyDto);
  }

  @Get()
  getAllSurveys() {
    return this.surveyService.getAllSurveys();
  }

  @Get('active')
  getActiveSurveys() {
    return this.surveyService.getActiveSurveys();
  }

  @Get(':id')
  getSurvey(@Param('id') id: string) {
    return this.surveyService.getSurveyById(id);
  }

  @Post(':id/submit')
  submitResponse(
    @Param('id') surveyId: string,
    @Body() submitResponseDto: SubmitResponseDto,
    @Ip() ip: string,
  ) {
    submitResponseDto.surveyId = surveyId;
    return this.surveyService.submitResponse(submitResponseDto, ip);
  }

  @Get(':id/results')
  getSurveyResults(
    @Param('id') id: string,
    @Query('includeUsers') includeUsers?: string,
  ) {
    const include = includeUsers === 'true';
    return this.surveyService.getSurveyResults(id, include);
  }

  @Delete(':id')
  deleteSurvey(@Param('id') id: string) {
    return this.surveyService.deleteSurvey(id);
  }
}
