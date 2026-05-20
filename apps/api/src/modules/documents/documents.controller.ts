import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request, Response } from 'express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateFolderDto } from './dto/create-folder.dto';
import { DocumentsService } from './documents.service';

@UseGuards(JwtAuthGuard)
@Controller()
export class DocumentsController {
  constructor(private readonly service: DocumentsService) {}

  // ── Folders ─────────────────────────────────────────────────────────────

  @Get('workspaces/:workspaceId/folders')
  listFolders(@Param('workspaceId') workspaceId: string) {
    return this.service.listFolders(workspaceId);
  }

  @Post('workspaces/:workspaceId/folders')
  createFolder(
    @Param('workspaceId') workspaceId: string,
    @Body() dto: CreateFolderDto,
  ) {
    return this.service.createFolder(workspaceId, dto.name);
  }

  // ── Documents ────────────────────────────────────────────────────────────

  @Get('workspaces/:workspaceId/documents')
  listDocuments(
    @Param('workspaceId') workspaceId: string,
    @Query('folderId') folderId?: string,
  ) {
    return this.service.listDocuments(workspaceId, folderId);
  }

  @Post('workspaces/:workspaceId/documents')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    }),
  )
  upload(
    @Param('workspaceId') workspaceId: string,
    @UploadedFile() file: Express.Multer.File,
    @Query('folderId') folderId: string | undefined,
    @Req() req: Request,
  ) {
    const user = req.user as { id: string };
    return this.service.upload({
      workspaceId,
      uploadedById: user.id,
      folderId: folderId || undefined,
      name: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      content: file.buffer,
    });
  }

  @Get('documents/:id/download')
  async download(@Param('id') id: string, @Res() res: Response) {
    const doc = await this.service.download(id);
    res.setHeader('Content-Type', doc.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(doc.name)}"`);
    res.setHeader('Content-Length', doc.content.length);
    res.end(doc.content);
  }

  @Delete('documents/:id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
