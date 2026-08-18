import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

// Get teacher dashboard stats
export const getTeacherDashboardStats = createAsyncThunk(
  "teacher/getTeacherDashboardStats",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/teacher/fetch-dashboard-stats");

      return res.data.data.dashboardStats;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to fetch dashboard stats";

      toast.error(message);

      return thunkAPI.rejectWithValue(message);
    }
  },
);

// // Get teacher requests
export const getTeacherRequests = createAsyncThunk(
  "getTeacherRequests",
  async (supervisorId, thunkAPI) => {
    try {
      const res = await axiosInstance.get(
        `/teacher/requests?supervisor=${supervisorId}`,
      );
      return res.data.data?.requests || res.data.data;
    } catch (error) {
      toast.error(error.response.data.message || "Failed to fetch requests");
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  },
);

// accept requests
export const acceptRequest = createAsyncThunk(
  "acceptRequest",
  async (requestId, thunkAPI) => {
    try {
      const res = await axiosInstance.put(
        `/teacher/requests/${requestId}/accept`,
      );
      toast.success(res.data.message || "Request accepted successfully");
      return res.data.data?.request || res.data;
    } catch (error) {
      toast.error(error.response.data.message || "Failed to accept request");
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  },
);

// reject requests
export const rejectRequest = createAsyncThunk(
  "rejectRequest",
  async (requestId, thunkAPI) => {
    try {
      const res = await axiosInstance.put(
        `/teacher/requests/${requestId}/reject`,
      );
      toast.success(res.data.message || "Request rejected successfully");
      return res.data.data?.request || res.data;
    } catch (error) {
      toast.error(error.response.data.message || "Failed to reject request");
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  },
);

// mark complete
export const markComplete = createAsyncThunk(
  "markComplete",
  async (projectId, thunkAPI) => {
    try {
      const res = await axiosInstance.post(
        `/teacher/mark-complete/${projectId}`,
      );
      toast.success(res.data.message || "Marked completed");
      return { projectId };
    } catch (error) {
      toast.error(error.response.data.message || "Failed to mark completed");
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  },
);

// download files
export const downloadTeacherFiles = createAsyncThunk(
  "downloadTeacherFiles",
  async({projectId, fileId}, thunkAPI)=>{
    try{

      const res = await axiosInstance.get(`/teacher/download/${projectId}/${fileId}`,{
        responseType: "blob",
      })
      return {blob:res.data,projectId,fileId}
    }catch(error){

      toast.error(error.response?.data?.message|| "Failed to download file");
      return thunkAPI.rejectWithValue(error.response?.data?.message)
    }
  }
)
// get files
export const getFiles = createAsyncThunk(
  "getTeacherFiles",
  async(_, thunkAPI)=>{
    try{

      const res = await axiosInstance.get(`/teacher/files`)
      return res.data?.data?.files || res.data.data;
    }catch(error){

      toast.error(error.response?.data?.message|| "Failed to fetch teacher file");
      return thunkAPI.rejectWithValue(error.response?.data?.message)
    }
  }
)


// add feedback
export const addFeedback = createAsyncThunk(
  "addFeedback",
  async ({ projectId, payload }, thunkAPI) => {
    try {
      const res = await axiosInstance.post(
        `/teacher/feedback/${projectId}`,
        payload,
      );
      toast.success(res.data.message || "Feedback posted");
      return {
        projectId,
        feedback: res.data.data?.feedback || res.data.data || res.data,
      };
    } catch (error) {
      toast.error(error.response.data.message || "Failed to post feedback");
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  },
);

// get assign student
export const getAssignedStudents = createAsyncThunk(
  "getAssignedStudents",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get(`/teacher/assigned-student`);
      return res.data.data?.students || res.data.data || res.data;
    } catch (error) {
      toast.error(
        error.response.data.message || "Failed to fetch assigned students",
      );
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  },
);

const teacherSlice = createSlice({
  name: "teacher",

  initialState: {
    assignedStudents: [],
    files: [],
    pendingRequests: [],
    dashboardStats: null,
    loading: false,
    error: null,
    list: [],
  },

  reducers: {},

  extraReducers: (builder) => {
    // get teacher dashboard stats
    builder.addCase(getTeacherDashboardStats.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(getTeacherDashboardStats.fulfilled, (state, action) => {
      state.loading = false;
      state.dashboardStats = action.payload;
    });

    builder.addCase(getTeacherDashboardStats.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to fetch dashboard stats";
    });

    // get assigned student
    builder.addCase(getAssignedStudents.pending, (state, action) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getAssignedStudents.fulfilled, (state, action) => {
      state.loading = false;
      state.assignedStudents = action.payload?.students || action.payload || [];
    });
    builder.addCase(getAssignedStudents.rejected, (state, action) => {
      state.error = action.payload || "Failed to fetch assigned students";
      state.loading = false;
    });

    builder.addCase(addFeedback.fulfilled, (state, action) => {
      const { projectId, feedback } = action.payload;
      state.assignedStudents = state.assignedStudents.map((s) =>
        s.projectId === projectId ? { ...s, feedback } : s,
      );
    });

    // builder.addCase(markComplete.fulfilled, (state, action) => {
    //   const { projectId } = action.payload;
    //   state.assignedStudents.state.assignedStudents.map((s) => {
    //     if (s.project._id === projectId) {
    //       return {
    //         ...s,
    //         project: {
    //           ...s.project,
    //           status: "completed",
    //         },
    //       };
    //     }
    //     return s;
    //   });
    // });

    builder.addCase(markComplete.fulfilled, (state, action) => {
  const { projectId } = action.payload;

  state.assignedStudents = state.assignedStudents.map((s) => {
    if (s.project?._id === projectId) {
      return {
        ...s,
        project: {
          ...s.project,
          status: "completed",
        },
      };
    }

    return s;
  });
});


    builder.addCase(getTeacherRequests.fulfilled, (state, action) => {
      state.list = action.payload || [];
    });

    builder.addCase(getFiles.fulfilled, (state, action) => {
      state.files = action.payload.files || action.payload || [];
    });

    builder.addCase(acceptRequest.fulfilled, (state, action) => {
      const updatedRequest = action.payload;
      state.list = state.list.map((r) =>
        r._id === updatedRequest._id ? updatedRequest : r,
      );
    });

    builder.addCase(rejectRequest.fulfilled, (state, action) => {
      const rejectedRequest = action.payload;
      state.list = state.list.filter((r) => r._id !== rejectedRequest._id);
    });
  },
});

export default teacherSlice.reducer;
