import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";




// submit project and thesis proposal
export const submitProjectProposal = createAsyncThunk(
  "student/submitProjectProposal",
  async (data, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/student/project-proposal", data);

      toast.success(res.data.message || "Proposal submitted successfully");
      return res.data.data || res.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to submit proposal";

      toast.error(message);

      return thunkAPI.rejectWithValue(message);
    }
  },
);

// fetch project
export const fetchProject = createAsyncThunk(
  "student/fetchProject",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/student/project");

      return res.data.data || res.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to fetch project";

      toast.error(message);

      return thunkAPI.rejectWithValue(message);
    }
  },
);

// get supervisor
export const getSupervisor = createAsyncThunk(
  "student/getSupervisor",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/student/supervisor");
      return res.data.data?.supervisor;
    } catch (error) {
      toast.error(error.response.data.message || "Failed to fetch supervisor");
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  },
);

// fetch all supervisor
export const fetchAllSupervisor = createAsyncThunk(
  "student/fetchAllSupervisor",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/student/fetch-supervisors");
      return res.data.data?.supervisors;
    } catch (error) {
      toast.error(
        error.response.data.message || "Failed to fetch avaiable supervisors",
      );
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  },
);

// request supervisor
export const requestSupervisor = createAsyncThunk(
  "student/requestSupervisor",
  async (data, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/student/request-supervisor", data);

      toast.success(
        res.data.message || "Supervisor request submitted successfully",
      );

      thunkAPI.dispatch(getSupervisor());

      return res.data.data?.request;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to request supervisor",
      );

      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

// upload files
export const uploadFiles = createAsyncThunk(
  "student/uploadFiles",
  async ({ workId, files }, { rejectWithValue }) => {
    try {
      const formData = new FormData();

      files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await axiosInstance.post(
        `/student/upload/${workId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      toast.success(response.data.message || "Files uploaded successfully");

      return response.data.data || response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to upload files";

      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

// fetch dashboard stats
export const fetchDashboardStats = createAsyncThunk(
  "fetchDashboardStats",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/student/fetch-dashboard-stats");
      return res.data.data || res.data;
    } catch (error) {
      toast.error(
        error.response.data.message || "Failed to fetch dashboard stats",
      );
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  },
);

// get feedback
export const getFeedback = createAsyncThunk(
  "getFeedback",
  async (projectId, thunkAPI) => {
    try {
      const res = await axiosInstance.get(`/student/feedback/${projectId}`);
      return res.data?.data?.feedback || res.data.data || res.data;
    } catch (error) {
      toast.error(error.response.data.message || "Failed to fetch feedback");

      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  },
);

// downloadFiles
export const downloadFiles = createAsyncThunk(
  "downloadFiles",
  async ({ workId, fileId }, thunkAPI) => {
    try {
      const res = await axiosInstance.get(
        `/student/download/${workId}/${fileId}`,
        {
          responseType: "blob",
        },
      );

      return {
        blob: res.data,
        workId,
        fileId,
      };
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to download file";

      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  },
);

// delete File
export const deleteFile = createAsyncThunk(
  "student/deleteFile",
  async ({ workId, fileId }, thunkAPI) => {
    try {
      const res = await axiosInstance.delete(
        `/student/files/${workId}/${fileId}`,
      );

      toast.success(res.data.message || "File deleted successfully");

      return { workId, fileId };
    } catch (error) {
      const message = error.response?.data?.message || "Failed to delete file";

      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  },
);

// add external resource link
export const addResourceLink = createAsyncThunk(
  "student/addResourceLink",
  async ({ workId, url }, thunkAPI) => {
    try {
      const res = await axiosInstance.post(`/student/links/${workId}`, { url });
      toast.success(res.data.message || "Link added successfully");
      return res.data.data?.work;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to add link";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  },
);

// delete external resource link
export const deleteResourceLink = createAsyncThunk(
  "student/deleteResourceLink",
  async ({ workId, linkId }, thunkAPI) => {
    try {
      const res = await axiosInstance.delete(`/student/links/${workId}/${linkId}`);
      toast.success(res.data.message || "Link deleted successfully");
      return res.data.data?.work;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to delete link";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  },
);

const studentSlice = createSlice({
  name: "student",
  initialState: {
    project: null,
    thesis: null,
    proposal: null,
    files: [],
    supervisors: [],
    dashboardStats: [],
    supervisor: null,
    deadlines: [],
    feedback: [],
    status: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    // submit Project Proposal
    builder.addCase(submitProjectProposal.fulfilled, (state, action) => {
      const data = action.payload || {};
      state.project = data.project || null;
      state.thesis = data.thesis || null;
      state.proposal = data.proposal || null;
      state.files =
        data.project?.files || data.thesis?.files || data.proposal?.files || [];
    });

    // fetch Project
    builder.addCase(fetchProject.fulfilled, (state, action) => {
      const data = action.payload || {};
      state.project = data.project || null;
      state.thesis = data.thesis || null;
      state.proposal = data.proposal || null;
      state.files =
        data.project?.files || data.thesis?.files || data.proposal?.files || [];
    });

    // get Supervisor
    builder.addCase(getSupervisor.fulfilled, (state, action) => {
      state.supervisor = action.payload?.supervisor || action.payload || null;
    });

    // fetch All Supervisor
    builder.addCase(fetchAllSupervisor.fulfilled, (state, action) => {
      state.supervisors = action.payload?.supervisors || action.payload || [];
    });

    // upload Files
    builder.addCase(uploadFiles.fulfilled, (state, action) => {
      const data = action.payload || {};
      if (data.project) {
        state.project = data.project;
        state.files = data.project.files || [];
      }

      if (data.thesis) {
        state.thesis = data.thesis;
        state.files = data.thesis.files || [];
      }
    });

    builder.addCase(addResourceLink.fulfilled, (state, action) => {
      const work = action.payload;
      if (work?.type === "Project") state.project = work;
      else if (work) state.thesis = work;
    });

    builder.addCase(deleteResourceLink.fulfilled, (state, action) => {
      const work = action.payload;
      if (work?.type === "Project") state.project = work;
      else if (work) state.thesis = work;
    });

    // get Feedback
    builder.addCase(getFeedback.fulfilled, (state, action) => {
      state.feedback = action.payload || [];
    });

    // fetch Dashboard Stats
    builder.addCase(fetchDashboardStats.fulfilled, (state, action) => {
      state.dashboardStats = action.payload || [];
    });
  },
});

export default studentSlice.reducer;
