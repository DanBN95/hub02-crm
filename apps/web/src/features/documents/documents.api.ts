import { apiClient } from '../../lib/api-client';

export interface Folder {
  id: string;
  name: string;
  createdAt: string;
  _count: { documents: number };
}

export interface DocumentMeta {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  folderId: string | null;
  createdAt: string;
  uploadedBy: { id: string; name: string; avatarUrl: string | null };
}

export const documentsApi = {
  listFolders: (workspaceId: string): Promise<Folder[]> =>
    apiClient.get(`/workspaces/${workspaceId}/folders`).then((r) => r.data as Folder[]),

  createFolder: (workspaceId: string, name: string): Promise<Folder> =>
    apiClient.post(`/workspaces/${workspaceId}/folders`, { name }).then((r) => r.data as Folder),

  listDocuments: (workspaceId: string, folderId?: string): Promise<DocumentMeta[]> =>
    apiClient
      .get(`/workspaces/${workspaceId}/documents`, {
        params: folderId ? { folderId } : {},
      })
      .then((r) => r.data as DocumentMeta[]),

  upload: (workspaceId: string, file: File, folderId?: string): Promise<DocumentMeta> => {
    const form = new FormData();
    form.append('file', file);
    return apiClient
      .post(`/workspaces/${workspaceId}/documents`, form, {
        params: folderId ? { folderId } : {},
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data as DocumentMeta);
  },

  download: async (id: string, name: string): Promise<void> => {
    const res = await apiClient.get(`/documents/${id}/download`, { responseType: 'blob' });
    const url = URL.createObjectURL(res.data as Blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  remove: (id: string): Promise<void> =>
    apiClient.delete(`/documents/${id}`).then(() => undefined),
};
