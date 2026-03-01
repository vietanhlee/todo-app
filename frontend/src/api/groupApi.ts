import api from "./axios";
import { Group, GroupInvite, GroupTask } from "../types";

// groups
export const getMyGroups = () => api.get<Group[]>("/group");
export const createGroup = (data: { name: string; description?: string }) =>
  api.post<Group>("/group", data);
export const findGroupByCode = (code: string) =>
  api.get<Group>(`/group/find/${code}`);
export const getGroup = (id: string) => api.get<Group>(`/group/${id}`);
export const updateGroup = (
  id: string,
  data: { name?: string; description?: string },
) => api.put<Group>(`/group/${id}`, data);
export const deleteGroup = (id: string) => api.delete(`/group/${id}`);
export const leaveGroup = (id: string) => api.delete(`/group/${id}/leave`);
export const removeMember = (groupId: string, memberId: string) =>
  api.delete(`/group/${groupId}/members/${memberId}`);

// invitations
export const inviteMember = (
  groupId: string,
  email: string,
  message?: string,
) => api.post(`/group/${groupId}/invite`, { email, message });
export const getMyInvitations = () =>
  api.get<GroupInvite[]>("/group/invitations/mine");
export const respondInvitation = (
  inviteId: string,
  action: "accept" | "reject",
) => api.patch(`/group/invitations/${inviteId}/respond`, { action });

// group tasks
export const getGroupTasks = (groupId: string) =>
  api.get<GroupTask[]>(`/group/${groupId}/tasks`);
export const createGroupTask = (
  groupId: string,
  data: Partial<GroupTask> & { assignTo?: string[] },
) => api.post<GroupTask>(`/group/${groupId}/tasks`, data);
export const updateGroupTask = (
  groupId: string,
  taskId: string,
  data: Partial<GroupTask>,
) => api.put<GroupTask>(`/group/${groupId}/tasks/${taskId}`, data);
export const deleteGroupTask = (groupId: string, taskId: string) =>
  api.delete(`/group/${groupId}/tasks/${taskId}`);
export const assignMember = (
  groupId: string,
  taskId: string,
  memberId: string,
) =>
  api.post<GroupTask>(`/group/${groupId}/tasks/${taskId}/assign`, { memberId });
export const respondAssignment = (
  groupId: string,
  taskId: string,
  action: string,
  note?: string,
) =>
  api.patch<GroupTask>(`/group/${groupId}/tasks/${taskId}/respond`, {
    action,
    note,
  });
export const addGroupTaskOutcome = (
  groupId: string,
  taskId: string,
  data: FormData,
) =>
  api.post<GroupTask>(`/group/${groupId}/tasks/${taskId}/outcomes`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const uploadGroupAvatar = (groupId: string, file: File) => {
  const form = new FormData();
  form.append("avatar", file);
  return api.post<import("../types").Group>(`/group/${groupId}/avatar`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
