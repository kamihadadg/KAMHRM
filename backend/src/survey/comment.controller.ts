import { Controller, Post, Body, Get, Headers, Query, HttpException, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserRole } from './entities/user.entity';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  create(@Body() dto: CreateCommentDto) {
    // allow anyone to post anonymous comments
    return this.commentService.create(dto);
  }

  @Get()
  findRecentPublic() {
    // Per requirement: regular users must NOT see any comments (even their own).
    // Return an empty array for public requests.
    return [] as any;
  }

  @Get('admin')
  async findRecentAdmin(@Headers('x-admin-secret') secret?: string, @Query('limit') limit?: string) {
    const adminSecret = process.env.ADMIN_SECRET;
    if (!adminSecret) {
      throw new HttpException('Admin secret not configured on server', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    if (!secret || secret !== adminSecret) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    const n = limit ? parseInt(limit, 10) : undefined;
    return this.commentService.findRecent(n ?? 50);
  }

  @Get('count')
  async publicCount() {
    const count = await this.commentService.countAll();
    return { count };
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/list')
  async getCommentsForAdmin(@Request() req, @Query('limit') limit?: string) {
    // Check if user is admin
    if (req.user.role !== UserRole.SUPERADMIN) {
      throw new HttpException('دسترسی غیرمجاز', HttpStatus.FORBIDDEN);
    }

    const n = limit ? parseInt(limit, 10) : undefined;
    return this.commentService.findRecent(n ?? 100);
  }
}
