import { SupervisorRequest } from "../models/supervisorRequest.js";

// create request
export const createRequest = async (requestData) => {
  const exisitingRequest = await SupervisorRequest.findOne({
    student: requestData.student,
    supervisor: requestData.supervisor,
    status: "pending",
  });

  if (exisitingRequest) {
    throw new Error(
      "You have already sent a request to this supervisor. Please wait for their response.",
    );
  }

  const request = await SupervisorRequest.create(requestData);

  return await request.save();
};

// get all requests
export const getAllRequests = async (filters) => {
  const requests = (
    await SupervisorRequest.find(filters)
      .populate("student", " name email")
      .populate("supervisor", "name email")
  ).sort({ createdAt: -1 });
  const total = await SupervisorRequest.countDocuments(filters);
  return { requests, total };
};

// accept requests
export const acceptRequests = async (requestId, supervisorId) => {
  const request = await SupervisorRequest.findById(requestId)
    .populate("student", "name email supervisor project")
    .populate("supervisor", "name email assignedStudents maxStudents");

  if (!request) throw new Error("Request not found");

  if (request.supervisor._id.toString() !== supervisorId) {
    throw new Error("Not authorized to accept this request");
  }

  if (request.status !== "pending") {
    throw new Error("Request has already been processed");
  }

  request.status = "accepted";
  await request.save();

  return request;
  };

// reject requests
export const rejectRequests = async (requestId, teacherId) => {
    const request = await SupervisorRequest.findById(requestId)
    .populate("student", "name email")
    .populate("supervisor", "name email");

 if (!request) throw new Error("Request not found");

  if (request.supervisor._id.toString() !== supervisorId) {
    throw new Error("Not authorized to reject this request");
  }
    if (request.status !== "pending") {
    throw new Error("Request has already been processed");
  }

    request.status = "rejected";
  await request.save();

  return request;

};
