import { userClient } from './client';
import { User, UserUpdate, AvatarUploadResponse } from '../types/user.types';

export const userApi = {
  createOrGet: (data: { name: string; email: string }) =>
    userClient.post<User>('/users', data).then(r => r.data),

  getMe: () =>
    userClient.get<User>('/users/me').then(r => r.data),

  updateMe: (data: UserUpdate) =>
    userClient.patch<User>('/users/me', data).then(r => r.data),

  getAvatarUploadUrl: () =>
    userClient.get<AvatarUploadResponse>('/users/me/avatar-upload-url').then(r => r.data),

  getById: (userId: string) =>
    userClient.get<User>(`/users/${userId}`).then(r => r.data),

  getManyByIds: (ids: string[]) =>
    userClient.get<User[]>('/users', { params: { ids: ids.join(',') } }).then(r => r.data),
};