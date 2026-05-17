import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CommentsRepository } from './comments.repository';

@Injectable()
export class CommentsService {
  constructor(private readonly repo: CommentsRepository) {}

  findByTask(taskId: string) {
    return this.repo.findByTask(taskId);
  }

  create(taskId: string, userId: string, content: string) {
    return this.repo.create(taskId, userId, content);
  }

  async remove(id: string, userId: string) {
    const deleted = await this.repo.delete(id, userId);
    if (deleted === false) {
      throw new ForbiddenException('Comment not found or not owned by you');
    }
  }
}
