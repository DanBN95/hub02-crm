import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { documentsApi } from './documents.api';

export function useFoldersList(workspaceId: string) {
  return useQuery({
    queryKey: ['folders', workspaceId],
    queryFn: () => documentsApi.listFolders(workspaceId),
    staleTime: 60_000,
    enabled: !!workspaceId,
  });
}

export function useCreateFolder(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => documentsApi.createFolder(workspaceId, name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['folders', workspaceId] }),
  });
}

export function useDocumentsList(workspaceId: string, folderId?: string) {
  return useQuery({
    queryKey: ['documents', workspaceId, folderId ?? 'general'],
    queryFn: () => documentsApi.listDocuments(workspaceId, folderId),
    staleTime: 30_000,
    enabled: !!workspaceId,
  });
}

export function useUploadDocument(workspaceId: string, folderId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => documentsApi.upload(workspaceId, file, folderId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['documents', workspaceId] });
      qc.invalidateQueries({ queryKey: ['folders', workspaceId] });
    },
  });
}

export function useDeleteDocument(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => documentsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['documents', workspaceId] });
      qc.invalidateQueries({ queryKey: ['folders', workspaceId] });
    },
  });
}
