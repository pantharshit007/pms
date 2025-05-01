import { UserRequest } from "../types/type";
import { ACCOUNT_ROLES, PROJECT_ROLES, ProjectRoleType } from "../types/role";
import { ITask } from "../models/task.model";
import { ISubtask } from "../models/subtask.model";
import { IMember } from "../models/member.model";

interface PermissionContext<TResouce = any> {
  user: UserRequest;
  member?: IMember | null;
  resource?: TResouce;
}

type PermissionCheck<TResouce> =
  | boolean
  | ((context: PermissionContext<TResouce> & { resource: TResouce }) => boolean);

type ProjectActions = "create" | "view" | "update" | "delete";
type NoteActions = "create" | "view" | "update" | "delete";
type TaskActions = "create" | "view" | "update" | "delete" | "updateStatus";
type SubTaskActions = "create" | "view" | "update" | "delete" | "complete";

type ProjectPermission<T> = Partial<Record<ProjectActions, PermissionCheck<T>>>;
type NotePermission<T> = Partial<Record<NoteActions, PermissionCheck<T>>>;
type TaskPermission<T> = Partial<Record<TaskActions, PermissionCheck<T>>>;
type SubTaskPermission<T> = Partial<Record<SubTaskActions, PermissionCheck<T>>>;

type PermissionSchema<T = any> = {
  Project: ProjectPermission<T>;
  Note: NotePermission<T>;
  Task: TaskPermission<T>;
  SubTask: SubTaskPermission<T>;
};

type AllowedActions = {
  Project: ProjectActions;
  Note: NoteActions;
  Task: TaskActions;
  SubTask: SubTaskActions;
};

// bit complex: specific action for specific resource
type ActionForResource<R extends keyof PermissionSchema> = AllowedActions[R];

type RolesWithPermission = {
  [key in ProjectRoleType]: PermissionSchema;
};

const PERMINSSIONS = {
  [PROJECT_ROLES.admin]: {
    Project: {
      create: true,
      view: true,
      update: true,
      delete: true,
    },
    Note: {
      create: true,
      view: true,
      update: true,
      delete: true,
    },
    Task: {
      create: true,
      view: true,
      update: true,
      delete: true,
      updateStatus: true,
    },
    SubTask: {
      create: true,
      view: true,
      update: true,
      delete: true,
      complete: true,
    },
  },
  [PROJECT_ROLES.project_manager]: {
    Project: { view: true },
    Note: {
      create: true,
      view: true,
      update: true,
      delete: true,
    },
    Task: {
      create: true,
      view: true,
      update: true,
      delete: true,
      updateStatus: true,
    },
    SubTask: {
      create: true,
      view: true,
      update: true,
      delete: true,
      complete: true,
    },
  },
  [PROJECT_ROLES.member]: {
    Project: { view: true },
    Note: { view: true },
    Task: {
      view: true,
      updateStatus: (context: PermissionContext<ITask>) => {
        return (
          !!context.resource &&
          context.resource.assignedTo.toString() === context.user._id.toString()
        );
      },
    },
    SubTask: {
      create: true,
      view: (ctx: PermissionContext<ISubtask & { tId: string }>) => {
        return checkSubTaskPermission(ctx);
      },
      update: (ctx: PermissionContext<ISubtask & { tId: string }>) => {
        return checkSubTaskPermission(ctx);
      },
      delete: (ctx: PermissionContext<ISubtask & { tId: string }>) => {
        return checkSubTaskPermission(ctx);
      },
      complete: (ctx: PermissionContext<ISubtask & { tId: string }>) => {
        return checkSubTaskPermission(ctx);
      },
    },
  },
} satisfies RolesWithPermission;

const checkSubTaskPermission = (ctx: PermissionContext<ISubtask & { tId: string }>) => {
  if (!ctx?.resource?.taskId || !ctx?.resource?.tId) return false;
  return (
    ctx.resource.taskId.toString() === ctx.resource.tId.toString() &&
    ctx.resource.createdBy.toString() === ctx.user._id.toString()
  );
};

export type HasPermissionType<
  R extends keyof PermissionSchema,
  A extends ActionForResource<R> = ActionForResource<R>,
  TResouce = any,
> = {
  user: UserRequest;
  memberShip: R extends "SubTask" ? undefined : IMember;
  resourceType: R;
  action: A;
  resource?: TResouce;
};

/**
 * Check if user has permission to perform action on resource
 * @user - User Request
 * @memberShip - Membership of the user, undefined for `resourceType=SubTask`
 * @resourceType - Resource Type
 * @action - Action `create`, `view`, `update`, `delete`, `updateStatus`, `complete`
 * @resource - Resource for the action `(fn)`
 * @returns
 */
function hasPermission<
  R extends keyof PermissionSchema,
  A extends ActionForResource<R>,
  TResouce = any,
>(params: HasPermissionType<R, A>): boolean {
  const { user, resourceType, action, memberShip, resource } = params;

  const accountRole = user.accountRole;
  const projectRole = memberShip ? memberShip.role : PROJECT_ROLES.member;

  // only `PRO` or `ADMIN` can create project
  if (resourceType === "Project" && action === "create") {
    return ["PRO", "ADMIN"].includes(accountRole);
  }

  const rolePermission = PERMINSSIONS[projectRole];
  if (!rolePermission) return false;

  const resourcePermission = rolePermission[resourceType];
  if (!resourcePermission) return false;

  const permissionCheck = resourcePermission[action as keyof typeof resourcePermission];

  if (permissionCheck === undefined || permissionCheck === null || !permissionCheck) return false;
  if (permissionCheck === true) return true;

  // If func, evaluate ABAC condition
  if (typeof permissionCheck === "function") {
    if (!resource) return false;

    const ctx = {
      user,
      member: memberShip,
      resource,
    } satisfies PermissionContext<TResouce>;
    return permissionCheck(ctx);
  }

  return false;
}

export { hasPermission };
