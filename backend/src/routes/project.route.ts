import { Router } from "express";
import { projCtxMiddleware } from "../middleware/proj-ctx.middleware";
import {
  addProjectMember,
  availableProjects,
  createProject,
  deleteProject,
  fetchMyProjects,
  getProjectById,
  getProjectMembers,
  removeProjectMember,
  updateProject,
  updateMemberRole,
} from "../controllers/proj.controller";
import { permit } from "../middleware/permit.middleware";
import { checkAuth } from "../middleware/auth.middleware";

const projectRouter = Router({ mergeParams: true });

projectRouter.post("/create", checkAuth(["ADMIN", "PRO"]), createProject);
projectRouter.get("/allProjects", checkAuth(["ADMIN"]), availableProjects); // get all projects [ADMIN]
projectRouter.get("/all", fetchMyProjects);
projectRouter.get("/get/:pId", projCtxMiddleware, permit("Project", "view"), getProjectById);
projectRouter.patch("/update/:pId", projCtxMiddleware, permit("Project", "update"), updateProject);
projectRouter.delete("/delete/:pId", projCtxMiddleware, permit("Project", "delete"), deleteProject);
projectRouter.get(
  "/member/get/:pId",
  projCtxMiddleware,
  permit("Project", "view"),
  getProjectMembers
);
projectRouter.post(
  "/member/add/:pId",
  projCtxMiddleware,
  permit("Project", "memberUpdate"),
  addProjectMember
);
projectRouter.delete(
  "/member/remove/:pId/:mId",
  projCtxMiddleware,
  permit("Project", "memberUpdate"),
  removeProjectMember
);
projectRouter.patch(
  "/member/update/:pId/:mId",
  projCtxMiddleware,
  permit("Project", "memberUpdate"),
  updateMemberRole
);

export { projectRouter };
