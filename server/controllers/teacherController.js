import { asyncHandler } from "../middlewares/asyncHandler.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/user.js";
import * as userServices from "../services/userServices.js";
import * as projectService from "../services/projectServices.js";
import * as requestServices from "../services/requestServices.js";
import * as notificationServices from "../services/notificationServices.js";
import { Project } from "../models/project.js";
import { Notification } from "../models/notification.js";
import * as fileServices from "../services/fileServices.js";
import { title } from "process";
import { type } from "os";


export const assignSupervisor = asyncHandler (async(req, resizeBy, next)=>{
    const {studentId, supervisorId} = req.body;

    if(!studentId ||supervisorId){
        return next (
            new ErrorHandler("Student ID and supervisor ID are required", 400)
        );
    }

    const project = await Project.findOne({student: studentId});

    if (project.supervisor !== null){
        return next( new ErrorHandler("Supervisor already assign", 400));
    }

    if(project.status !== "approved"){
        return next(new ErrorHandler("Project not approved yest"))
    }
})