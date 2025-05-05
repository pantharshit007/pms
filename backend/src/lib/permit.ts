import { UserRequest } from "../types/type";
import { PROJECT_ROLES, ProjectRoleType } from "../types/role";
import { ITask } from "../models/task.model";
import { ISubTask } from "../models/subtask.model";
import { IMember } from "../models/member.model";

interface PermissionContext<TResouce = any> {
  user: UserRequest;
  member?: IMember | null;
  resource?: TResouce;
}

type PermissionCheck<TResouce> =
  | boolean
  | ((context: PermissionContext<TResouce> & { resource: TResouce }) => boolean);

type ProjectActions = "create" | "view" | "update" | "delete" | "memberUpdate";
type NoteActions = "create" | "view" | "update" | "delete";
type TaskActions = "create" | "view" | "update" | "delete" | "updateStatus";
type SubTaskActions = "create" | "view" | "update" | "delete" | "complete";

type ProjectPermission<T> = Partial<Record<ProjectActions, PermissionCheck<T>>>;
type NotePermission<T> = Partial<Record<NoteActions, PermissionCheck<T>>>;
type TaskPermission<T> = Partial<Record<TaskActions, PermissionCheck<T>>>;
type SubTaskPermission<T> = Partial<Record<SubTaskActions, PermissionCheck<T>>>;

export type PermissionSchema<T = any> = {
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
export type ActionForResource<R extends keyof PermissionSchema> = AllowedActions[R];

type RolesWithPermission = {
  [key in ProjectRoleType]: PermissionSchema;
};

const PERMINSSIONS = {
  [PROJECT_ROLES.lead]: {
    Project: {
      create: true,
      view: true,
      update: true,
      delete: true,
      memberUpdate: true,
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
  [PROJECT_ROLES.manager]: {
    Project: { view: true, memberUpdate: true },
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
      view: (ctx: PermissionContext<ISubTask & { tId: string }>) => {
        return checkSubTaskPermission(ctx);
      },
      update: (ctx: PermissionContext<ISubTask & { tId: string }>) => {
        return checkSubTaskPermission(ctx);
      },
      delete: (ctx: PermissionContext<ISubTask & { tId: string }>) => {
        return checkSubTaskPermission(ctx);
      },
      complete: (ctx: PermissionContext<ISubTask & { tId: string }>) => {
        return checkSubTaskPermission(ctx);
      },
    },
  },
} satisfies RolesWithPermission;

const checkSubTaskPermission = (ctx: PermissionContext<ISubTask & { tId: string }>) => {
  if (!ctx?.resource?.task || !ctx?.resource?.tId) return false;
  return (
    ctx.resource.task.toString() === ctx.resource.tId.toString() &&
    ctx.resource.createdBy.toString() === ctx.user._id.toString()
  );
};

export type HasPermissionType<
  R extends keyof PermissionSchema,
  A extends ActionForResource<R> = ActionForResource<R>,
  TResouce = any,
> = {
  user: UserRequest;
  memberShip: IMember | undefined;
  resourceType: R;
  action: A;
  resource?: TResouce;
};

/**
 * Check if user has permission to perform action on resource
 * @user User Request
 * @memberShip Membership of the user
 * @resourceType `Project | Note | Task | SubTask`
 * @action Action `create`, `view`, `update`, `delete`, `updateStatus`, `complete`
 * @resource Resource for the action `(fn)`
 * @returns Boolean
 */
function hasPermission<
  R extends keyof PermissionSchema,
  A extends ActionForResource<R>,
  TResouce = any,
>(params: HasPermissionType<R, A>): { success: boolean; message: string } {
  const { user, resourceType, action, memberShip, resource } = params;

  const projectRole = memberShip?.role ?? "MEMBER";

  const rolePermission = PERMINSSIONS[projectRole];
  if (!rolePermission) return { success: false, message: "Invalid role" };

  const resourcePermission = rolePermission[resourceType];
  if (!resourcePermission)
    return { success: false, message: "Unauthorized: Insufficient permissions" };

  const permissionCheck = resourcePermission[action as keyof typeof resourcePermission];

  if (permissionCheck === undefined || permissionCheck === null || !permissionCheck)
    return { success: false, message: "Invalid permission check" };
  if (permissionCheck === true) return { success: true, message: "Permission granted" };

  // If func, evaluate ABAC condition
  if (typeof permissionCheck === "function") {
    if (!resource) return { success: false, message: "Invalid: resource Not found" };

    const ctx = {
      user,
      member: memberShip,
      resource,
    } satisfies PermissionContext<TResouce>;

    return (permissionCheck(ctx) as boolean)
      ? { success: true, message: "Permission granted!" }
      : { success: false, message: "Unauthorized: Insufficient permissions (SubTask)" };
  }

  return { success: false, message: "Invalid permission check" };
}

export { hasPermission };
