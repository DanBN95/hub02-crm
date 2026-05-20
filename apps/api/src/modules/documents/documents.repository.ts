import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface FolderRecord {
  id: string;
  name: string;
  createdAt: Date;
  _count: { documents: number };
}

export interface DocumentMeta {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  folderId: string | null;
  createdAt: Date;
  uploadedBy: { id: string; name: string; avatarUrl: string | null };
}

@Injectable()
export class DocumentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ── Folders ──────────────────────────────────────────────────────────────

  createFolder(workspaceId: string, name: string): Promise<FolderRecord> {
    return this.prisma.folder.create({
      data: { workspaceId, name },
      include: { _count: { select: { documents: true } } },
    });
  }

  listFolders(workspaceId: string): Promise<FolderRecord[]> {
    return this.prisma.folder.findMany({
      where: { workspaceId },
      include: { _count: { select: { documents: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  // ── Documents ────────────────────────────────────────────────────────────

  createDocument(data: {
    workspaceId: string;
    uploadedById: string;
    folderId?: string;
    name: string;
    mimeType: string;
    size: number;
    content: Buffer;
  }): Promise<DocumentMeta> {
    return this.prisma.document.create({
      data: {
        workspaceId: data.workspaceId,
        uploadedById: data.uploadedById,
        folderId: data.folderId ?? null,
        name: data.name,
        mimeType: data.mimeType,
        size: data.size,
        content: data.content as unknown as Uint8Array<ArrayBuffer>,
      },
      select: {
        id: true,
        name: true,
        mimeType: true,
        size: true,
        folderId: true,
        createdAt: true,
        uploadedBy: { select: { id: true, name: true, avatarUrl: true } },
      },
    }) as unknown as Promise<DocumentMeta>;
  }

  listDocuments(workspaceId: string, folderId?: string): Promise<DocumentMeta[]> {
    return this.prisma.document.findMany({
      where: {
        workspaceId,
        folderId: folderId === 'general' ? null : (folderId ?? undefined),
      },
      select: {
        id: true,
        name: true,
        mimeType: true,
        size: true,
        folderId: true,
        createdAt: true,
        uploadedBy: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getDocumentContent(id: string): Promise<{ name: string; mimeType: string; content: Uint8Array } | null> {
    const doc = await this.prisma.document.findUnique({
      where: { id },
      select: { name: true, mimeType: true, content: true },
    });
    if (!doc) return null;
    return { name: doc.name, mimeType: doc.mimeType, content: doc.content };
  }

  deleteDocument(id: string) {
    return this.prisma.document.delete({ where: { id } });
  }
}
