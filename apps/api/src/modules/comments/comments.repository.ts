import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const commentWithUser = {
  user: { select: { id: true, name: true, avatarUrl: true, email: true } },
} as const;

@Injectable()
export class CommentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByTask(taskId: string) {
    return this.prisma.comment.findMany({
      where: { taskId },
      include: commentWithUser,
      orderBy: { createdAt: 'asc' },
    });
  }

  create(taskId: string, userId: string, content: string) {
    return this.prisma.comment.create({
      data: { taskId, userId, content },
      include: commentWithUser,
    });
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment || comment.userId !== userId) return false;
    await this.prisma.comment.delete({ where: { id } });
    return true;
  }
}
