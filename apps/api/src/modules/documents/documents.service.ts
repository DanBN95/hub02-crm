import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DocumentsRepository } from './documents.repository';

@Injectable()
export class DocumentsService {
  constructor(private readonly repo: DocumentsRepository) {}

  listFolders(workspaceId: string) {
    return this.repo.listFolders(workspaceId);
  }

  async createFolder(workspaceId: string, name: string) {
    try {
      return await this.repo.createFolder(workspaceId, name);
    } catch (err: any) {
      if (err?.code === 'P2002') throw new ConflictException(`Folder "${name}" already exists.`);
      throw err;
    }
  }

  listDocuments(workspaceId: string, folderId?: string) {
    return this.repo.listDocuments(workspaceId, folderId);
  }

  upload(data: {
    workspaceId: string;
    uploadedById: string;
    folderId?: string;
    name: string;
    mimeType: string;
    size: number;
    content: Buffer;
  }) {
    return this.repo.createDocument(data);
  }

  async download(id: string) {
    const doc = await this.repo.getDocumentContent(id);
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  async remove(id: string) {
    try {
      await this.repo.deleteDocument(id);
    } catch (err: any) {
      if (err?.code === 'P2025') throw new NotFoundException('Document not found');
      throw err;
    }
  }
}
