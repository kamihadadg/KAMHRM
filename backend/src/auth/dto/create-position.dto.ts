import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class CreatePositionDto {
  @IsString()
  @IsNotEmpty({ message: 'عنوان سمت الزامی است' })
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  parentPositionId?: string;

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsOptional()
  isAggregate?: boolean;

  @IsOptional()
  @IsNumber()
  colorScheme?: number;
}
