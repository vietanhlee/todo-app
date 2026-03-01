import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { Group, GroupInvite, GroupTask } from "../types";
import * as groupApi from "../api/groupApi";
import toast from "react-hot-toast";

interface GroupContextType {
  groups: Group[];
  invitations: GroupInvite[];
  loadingGroups: boolean;
  fetchGroups: () => Promise<void>;
  fetchInvitations: () => Promise<void>;
  createGroup: (data: { name: string; description?: string }) => Promise<Group>;
  updateGroup: (
    id: string,
    data: { name?: string; description?: string },
  ) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;
  leaveGroup: (id: string) => Promise<void>;
  removeMember: (groupId: string, memberId: string) => Promise<void>;
  inviteMember: (
    groupId: string,
    email: string,
    message?: string,
  ) => Promise<void>;
  respondInvitation: (
    inviteId: string,
    action: "accept" | "reject",
  ) => Promise<void>;
  getGroupTasks: (groupId: string) => Promise<GroupTask[]>;
  createGroupTask: (
    groupId: string,
    data: Partial<GroupTask> & { assignTo?: string[] },
  ) => Promise<GroupTask>;
  updateGroupTask: (
    groupId: string,
    taskId: string,
    data: Partial<GroupTask>,
  ) => Promise<GroupTask>;
  deleteGroupTask: (groupId: string, taskId: string) => Promise<void>;
  assignMember: (
    groupId: string,
    taskId: string,
    memberId: string,
  ) => Promise<GroupTask>;
  respondAssignment: (
    groupId: string,
    taskId: string,
    action: string,
    note?: string,
  ) => Promise<GroupTask>;
  uploadGroupAvatar: (groupId: string, file: File) => Promise<void>;
}

const GroupContext = createContext<GroupContextType | undefined>(undefined);

export const GroupProvider = ({ children }: { children: ReactNode }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [invitations, setInvitations] = useState<GroupInvite[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);

  const fetchGroups = useCallback(async () => {
    setLoadingGroups(true);
    try {
      const res = await groupApi.getMyGroups();
      setGroups(res.data);
    } finally {
      setLoadingGroups(false);
    }
  }, []);

  const fetchInvitations = useCallback(async () => {
    try {
      const res = await groupApi.getMyInvitations();
      setInvitations(res.data);
    } catch {
      /* silent */
    }
  }, []);

  useEffect(() => {
    fetchGroups();
    fetchInvitations();
  }, []);

  const createGroup = useCallback(
    async (data: { name: string; description?: string }) => {
      const res = await groupApi.createGroup(data);
      setGroups((prev) => [res.data, ...prev]);
      toast.success("Group created!");
      return res.data;
    },
    [],
  );

  const updateGroup = useCallback(
    async (id: string, data: { name?: string; description?: string }) => {
      await groupApi.updateGroup(id, data);
      await fetchGroups();
      toast.success("Group updated");
    },
    [],
  );

  const deleteGroup = useCallback(async (id: string) => {
    await groupApi.deleteGroup(id);
    setGroups((prev) => prev.filter((g) => g._id !== id));
    toast.success("Group deleted");
  }, []);

  const leaveGroup = useCallback(async (id: string) => {
    await groupApi.leaveGroup(id);
    setGroups((prev) => prev.filter((g) => g._id !== id));
    toast.success("Left group");
  }, []);

  const removeMember = useCallback(
    async (groupId: string, memberId: string) => {
      await groupApi.removeMember(groupId, memberId);
      await fetchGroups();
      toast.success("Member removed");
    },
    [],
  );

  const inviteMember = useCallback(
    async (groupId: string, email: string, message?: string) => {
      await groupApi.inviteMember(groupId, email, message);
      toast.success("Invitation sent!");
    },
    [],
  );

  const respondInvitation = useCallback(
    async (inviteId: string, action: "accept" | "reject") => {
      await groupApi.respondInvitation(inviteId, action);
      setInvitations((prev) => prev.filter((i) => i._id !== inviteId));
      if (action === "accept") {
        await fetchGroups();
        toast.success("Joined group!");
      } else toast.success("Invitation declined");
    },
    [],
  );

  const getGroupTasks = useCallback(async (groupId: string) => {
    const res = await groupApi.getGroupTasks(groupId);
    return res.data;
  }, []);

  const createGroupTask = useCallback(
    async (
      groupId: string,
      data: Partial<GroupTask> & { assignTo?: string[] },
    ) => {
      const res = await groupApi.createGroupTask(groupId, data);
      return res.data;
    },
    [],
  );

  const updateGroupTask = useCallback(
    async (groupId: string, taskId: string, data: Partial<GroupTask>) => {
      const res = await groupApi.updateGroupTask(groupId, taskId, data);
      return res.data;
    },
    [],
  );

  const deleteGroupTask = useCallback(
    async (groupId: string, taskId: string) => {
      await groupApi.deleteGroupTask(groupId, taskId);
    },
    [],
  );

  const assignMember = useCallback(
    async (groupId: string, taskId: string, memberId: string) => {
      const res = await groupApi.assignMember(groupId, taskId, memberId);
      return res.data;
    },
    [],
  );

  const respondAssignment = useCallback(
    async (groupId: string, taskId: string, action: string, note?: string) => {
      const res = await groupApi.respondAssignment(
        groupId,
        taskId,
        action,
        note,
      );
      return res.data;
    },
    [],
  );

  const uploadGroupAvatar = useCallback(async (groupId: string, file: File) => {
    const res = await groupApi.uploadGroupAvatar(groupId, file);
    setGroups((prev) => prev.map((g) => (g._id === groupId ? res.data : g)));
    toast.success("Group avatar updated!");
  }, []);

  return (
    <GroupContext.Provider
      value={{
        groups,
        invitations,
        loadingGroups,
        fetchGroups,
        fetchInvitations,
        createGroup,
        updateGroup,
        deleteGroup,
        leaveGroup,
        removeMember,
        inviteMember,
        respondInvitation,
        getGroupTasks,
        createGroupTask,
        updateGroupTask,
        deleteGroupTask,
        assignMember,
        respondAssignment,
        uploadGroupAvatar,
      }}
    >
      {children}
    </GroupContext.Provider>
  );
};

export const useGroups = () => {
  const ctx = useContext(GroupContext);
  if (!ctx) throw new Error("useGroups must be used within GroupProvider");
  return ctx;
};
