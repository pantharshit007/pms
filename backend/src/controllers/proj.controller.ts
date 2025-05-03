import { Request, Response } from "express";
import { CustomError } from "../utils/custom-error";
import { apiResponse } from "../utils/api-response";
import { hasPermission } from "../lib/permit";
import { fetchMyProjectsAPI, getProjectMembersAPI, UserRequest } from "../types/type";
import { IMember, ProjectMember } from "../models/member.model";
import { Schema, startSession, Types } from "mongoose";
import { IProject, Project } from "../models/project.model";
import { PROJECT_ROLES, ProjectRole } from "../types/role";
import { tryCatch } from "../utils/try-catch";
import {
  addProjectMemberSchema,
  ProjectSchema,
  updateMemberRoleSchema,
  updateProjectSchema,
} from "../validations/project-schema";
import { User, UserDocument } from "../models/user.model";

async function createProject(req: Request, res: Response) {
  const session = await startSession();
  try {
    const parsedBody = ProjectSchema.safeParse(req.body);
    if (!parsedBody.success) {
      throw new CustomError(
        400,
        parsedBody.error.errors.map((err) => err.path + ":" + err.message).join("\n")
      );
    }
    const { name, description } = parsedBody.data;

    const user = req.user as UserRequest;
    const userId = user._id;

    session.startTransaction();

    async function commit() {
      const newProject = await Project.create(
        [
          {
            name,
            description,
            createdBy: userId,
          },
        ],
        { session }
      );

      await ProjectMember.create(
        [
          {
            project: newProject[0]._id,
            user: newProject[0].createdBy,
            role: PROJECT_ROLES.lead,
          },
        ],
        { session }
      );

      return newProject[0];
    }

    const committed = await tryCatch<IProject, any>(commit());
    if (committed.error) {
      session.abortTransaction();
      if (committed.error.code === 11000) {
        throw new CustomError(400, "Project already exists");
      }
      throw new CustomError(500, `Failed: ${committed.error.message}`);
    }

    await session.commitTransaction(); //prevent abort err

    return apiResponse({
      res,
      success: true,
      status: 200,
      message: "Project created!",
      data: committed.data,
    });
  } catch (err) {
    console.error("[CREATE-PROJECT] Error: ", err);
    if (err instanceof CustomError) {
      return apiResponse({
        res,
        success: false,
        status: err.status ?? 500,
        message: err.message,
      });
    }
    throw err;
  } finally {
    session.endSession();
  }
}

async function fetchMyProjects(req: Request, res: Response) {
  try {
    const userId = req.user?._id;
    const myProjects = (await ProjectMember.aggregate([
      { $match: { user: new Types.ObjectId(userId) } },
      {
        $lookup: {
          from: "projects",
          localField: "project",
          foreignField: "_id",
          as: "projectData",
        },
      },
      { $unwind: "$projectData" },
      {
        $lookup: {
          from: "users",
          localField: "projectData.createdBy",
          foreignField: "_id",
          as: "userData",
        },
      },
      { $unwind: "$userData" },
      {
        $lookup: {
          from: "projectmembers",
          let: { pId: "$project" },
          pipeline: [{ $match: { $expr: { $eq: ["$project", "$$pId"] } } }, { $count: "count" }],
          as: "memberCount",
        },
      },
      {
        $addFields: {
          totalMembers: { $ifNull: [{ $arrayElemAt: ["$memberCount.count", 0] }, 0] },
        },
      },
      {
        $project: {
          _id: 0,
          pId: "$projectData._id",
          name: "$projectData.name",
          description: "$projectData.description",
          createdBy: {
            email: "$userData.email",
            username: "$userData.username",
          },
          role: 1,
          totalMembers: 1,
        },
      },
    ])) satisfies fetchMyProjectsAPI[];

    return apiResponse({
      res,
      success: true,
      status: 200,
      message: "My Projects fetched!",
      data: myProjects,
    });
  } catch (err) {
    console.error("[FETCH-MY-PROJECTS] Error: ", err);
    if (err instanceof CustomError) {
      return apiResponse({
        res,
        success: false,
        status: err.status ?? 500,
        message: err.message,
      });
    }
    throw err;
  }
}

async function getProjectById(req: Request, res: Response) {
  try {
    const { pId } = req.params as { pId: string };

    const project = await Project.findById(pId)
      .populate("createdBy", "fullName username email avatar")
      .lean();

    const members = await ProjectMember.find({ project: pId })
      .populate("user", "fullName username email avatar")
      .select("_id user role")
      .lean();

    const projectData = { projInfo: project, members };

    return apiResponse({
      res,
      success: true,
      status: 200,
      message: "Project fetched!",
      data: projectData,
    });
  } catch (err) {
    console.error("[GET-PROJECT-BY-ID] Error: ", err);
    if (err instanceof CustomError) {
      return apiResponse({
        res,
        success: false,
        status: err.status ?? 500,
        message: err.message,
      });
    }
    throw err;
  }
}

async function updateProject(req: Request, res: Response) {
  try {
    const parsedBody = updateProjectSchema.safeParse(req.body);
    if (!parsedBody.success) {
      throw new CustomError(
        400,
        parsedBody.error.errors.map((err) => err.path + ":" + err.message).join("\n")
      );
    }

    const { name, description } = parsedBody.data;
    const pId = req.params.pId;

    let payload: Partial<{ name: string; description: string }> = {};

    if (name) payload.name = name;
    if (description) payload.description = description;

    const project = await Project.findByIdAndUpdate(pId, payload, { new: true });
    if (!project) throw new CustomError(400, "Failed to update project");

    return apiResponse({
      res,
      success: true,
      status: 200,
      message: "Project updated!",
      data: project,
    });
  } catch (err) {
    console.error("[UPDATE-PROJECT] Error: ", err);
    if (err instanceof CustomError) {
      return apiResponse({
        res,
        success: false,
        status: err.status ?? 500,
        message: err.message,
      });
    }
    throw err;
  }
}

// TODO: still some extras left to do.
async function deleteProject(req: Request, res: Response) {
  const session = await startSession();
  try {
    const pId = req.params.pId;

    session.startTransaction();
    async function commit() {
      await Project.findByIdAndDelete(pId);
      return;
    }

    const committed = await tryCatch(commit());
    if (committed.error) {
      session.abortTransaction();
      throw new CustomError(500, `Failed: ${committed.error.message}`);
    }

    await session.commitTransaction(); //prevent abort err
    return apiResponse({
      res,
      success: true,
      status: 200,
      message: "Project deleted!",
    });
  } catch (err) {
    console.error("[DELETE-PROJECT] Error: ", err);
    if (err instanceof CustomError) {
      return apiResponse({
        res,
        success: false,
        status: err.status ?? 500,
        message: err.message,
      });
    }
    throw err;
  } finally {
    session.endSession();
  }
}

async function getProjectMembers(req: Request, res: Response) {
  try {
    const pId = req.params.pId;
    const members = await ProjectMember.find({ project: pId })
      .populate("user", "fullName username email avatar _id")
      .select("role")
      .lean();

    const memberData = members.map((member) => {
      const user = member.user as unknown as UserDocument;
      return {
        _id: user._id as Schema.Types.ObjectId,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        avatar: user.avatar,
        role: member.role,
      };
    });

    const totalMembers = members.length;
    return apiResponse({
      res,
      success: true,
      status: 200,
      message: "Project members fetched!",
      data: { totalMembers, members: memberData } satisfies getProjectMembersAPI,
    });
  } catch (err) {
    console.error("[GET-PROJECT-MEMBERS] Error: ", err);
    if (err instanceof CustomError) {
      return apiResponse({
        res,
        success: false,
        status: err.status ?? 500,
        message: err.message,
      });
    }
    throw err;
  }
}

async function addProjectMember(req: Request, res: Response) {
  try {
    const parsedBody = addProjectMemberSchema.safeParse(req.body);
    if (!parsedBody.success) {
      throw new CustomError(
        400,
        parsedBody.error.errors.map((err) => err.path + ":" + err.message).join("\n")
      );
    }
    const { email, role } = parsedBody.data;
    const pId = req.params.pId;
    const initiator = req.member;

    if (email === req.user?.email)
      throw new CustomError(400, "You cannot add yourself as a member");

    if (initiator?.role === "MANAGER" && role === "LEAD") {
      throw new CustomError(400, "Manager can't assign Lead");
    }

    const user = await User.findOne({ email }).lean();
    if (!user) throw new CustomError(400, "User not found");

    const projectMember = await ProjectMember.findOne({ project: pId, user: user._id }).lean();
    if (projectMember) throw new CustomError(400, "User already exists in this project");

    const newMember = await ProjectMember.create({
      project: pId,
      user: user._id,
      role,
    });

    return apiResponse({
      res,
      success: true,
      status: 200,
      message: "Project member added!",
      data: newMember,
    });
  } catch (err) {
    console.error("[ADD-PROJECT-MEMBER] Error: ", err);
    if (err instanceof CustomError) {
      return apiResponse({
        res,
        success: false,
        status: err.status ?? 500,
        message: err.message,
      });
    }
    throw err;
  }
}

async function removeProjectMember(req: Request, res: Response) {
  try {
    const pId = req.params.pId;
    const mId = req.params.mId;
    const initiator = req.member as IMember;

    if (!Types.ObjectId.isValid(mId)) throw new CustomError(400, "Invalid Member ID");

    if (initiator.user.toString() === mId || mId === req.user?._id) {
      throw new CustomError(400, "You cannot remove yourself");
    }

    // manager cant remove lead and cant remove other manager
    const roleValues = {
      [PROJECT_ROLES.lead]: 3,
      [PROJECT_ROLES.manager]: 2,
      [PROJECT_ROLES.member]: 1,
    };

    const targetMember = await ProjectMember.findOne({
      project: new Types.ObjectId(pId),
      user: new Types.ObjectId(mId),
    }).lean();

    if (!targetMember) throw new CustomError(400, "Invalid Member ID");

    const inititorVal = roleValues[initiator.role];
    const targetVal = roleValues[targetMember.role];

    if (inititorVal <= targetVal)
      throw new CustomError(400, "You don't have permission to remove this member");

    await ProjectMember.deleteOne({ _id: targetMember._id });
    return apiResponse({
      res,
      success: true,
      status: 200,
      message: "Project member removed!",
    });
  } catch (err) {
    console.error("[REMOVE-PROJECT-MEMBER] Error: ", err);
    if (err instanceof CustomError) {
      return apiResponse({
        res,
        success: false,
        status: err.status ?? 500,
        message: err.message,
      });
    }
    throw err;
  }
}

async function updateMemberRole(req: Request, res: Response) {
  try {
    const pId = req.params.pId;
    const mId = req.params.mId;
    const initiator = req.member;

    if (!Types.ObjectId.isValid(mId)) throw new CustomError(400, "Invalid Member ID");

    const parsedBody = updateMemberRoleSchema.safeParse(req.body);
    if (!parsedBody.success) {
      throw new CustomError(
        400,
        parsedBody.error.errors.map((err) => err.path + ":" + err.message).join("\n")
      );
    }

    const { role } = parsedBody.data;

    if (initiator?.role === "MANAGER" && role === "LEAD") {
      throw new CustomError(400, "Manager can't assign Lead");
    }

    if (initiator?.user === req.user?._id || mId === req.user?._id) {
      throw new CustomError(400, "You cannot assign yourself");
    }

    const projectMember = await ProjectMember.findOne({ project: pId, user: mId }).lean();
    if (!projectMember) throw new CustomError(400, "User not found");

    if (projectMember.role === role) throw new CustomError(400, "Same role can't be assigned");

    const updatedMember = await ProjectMember.findOneAndUpdate(
      { project: pId, user: mId },
      { role },
      { new: true }
    );
    if (!updatedMember) throw new CustomError(400, "Failed to update project member");

    return apiResponse({
      res,
      success: true,
      status: 200,
      message: "Role updated!",
      data: updatedMember,
    });
  } catch (err) {
    console.error("[UPDATE-MEMBER-ROLE] Error: ", err);
    if (err instanceof CustomError) {
      return apiResponse({
        res,
        success: false,
        status: err.status ?? 500,
        message: err.message,
      });
    }
    throw err;
  }
}

// LEAD only
async function availableProjects(req: Request, res: Response) {
  try {
    const availableProjects = await Project.find().lean();
    if (!availableProjects) {
      return apiResponse({
        res,
        success: false,
        status: 400,
        message: "No projects found",
      });
    }

    return apiResponse({
      res,
      success: true,
      status: 200,
      message: "Projects fetched!",
      data: availableProjects,
    });
  } catch (err) {
    console.error("[AVAILABLE-PROJECTS] Error: ", err);
    if (err instanceof CustomError) {
      return apiResponse({
        res,
        success: false,
        status: err.status ?? 500,
        message: err.message,
      });
    }
    throw err;
  }
}

export {
  createProject,
  availableProjects,
  fetchMyProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectMembers,
  addProjectMember,
  removeProjectMember,
  updateMemberRole,
};
