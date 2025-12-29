import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from '../survey/entities/comment.entity';
import { CommentService } from '../survey/comment.service';
import { CommentController } from '../survey/comment.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Comment])],
  controllers: [CommentController],
  providers: [CommentService],
  exports: [CommentService],
})
export class FeedbackModule {}

