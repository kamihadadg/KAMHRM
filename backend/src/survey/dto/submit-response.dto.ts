import { IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ResponseAnswerDto {
  @IsString()
  questionId: string;

  @IsString()
  answer: string;
}

export class SubmitResponseDto {
  @IsString()
  surveyId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResponseAnswerDto)
  responses: ResponseAnswerDto[];

  // If the client provides user info when logged in, include it.
  isAnonymous?: boolean;
  userId?: string;
  username?: string;
}
