import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
  ) {}

  async create(dto: CreateCommentDto): Promise<Comment> {
    const comment = this.commentRepository.create({
      name: dto.name || null,
      message: dto.message,
    });
    return this.commentRepository.save(comment);
  }

  async findRecent(limit = 50): Promise<Comment[]> {
    return this.commentRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async countAll(): Promise<number> {
    return this.commentRepository.count();
  }
}
