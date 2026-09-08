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

// Get teacher requests
// export const getTeacherRequests = createAsyncThunk(
//   "getTeacherRequests",
//   async (supervisorId, thunkAPI) => {
//     try {
//       const res = await axiosInstance.get(
//         `/teacher/requests?supervisor=${supervisorId}`,
//       );
//       return res.data.data?.requests || res.data.data;
//     } catch (error) {
//       toast.error(error.response.data.message || "Failed to fetch requests");
//       return thunkAPI.rejectWithValue(error.response.data.message);
//     }
//   },
// );

export const getTeacherRequests = createAsyncThunk(
  "getTeacherRequests",
  async (supervisorId, thunkAPI) => {
    try {
      const res = await axiosInstance.get(
        `/teacher/requests?supervisor=${supervisorId}`,
      );

      return res.data.data?.requests || res.data.data || [];
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to fetch requests";

      toast.error(message);

      return thunkAPI.rejectWithValue(message);
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

export const deleteRequest = createAsyncThunk(
  "teacher/deleteRequest",
  async (requestId, thunkAPI) => {
    try {
      const res = await axiosInstance.delete(`/teacher/requests/${requestId}`);
      toast.success(res.data.message || "Request deleted successfully");

      return requestId;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to delete request";

      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  },
);

// mark complete
export const markComplete = createAsyncThunk(
  "teacher/markComplete",
  async ({ workId, workType }, thunkAPI) => {
    try {
      const res = await axiosInstance.post(`/teacher/mark-complete/${workId}`, {
        workType,
      });

      toast.success(res.data.message || "Marked completed");

      return {
        workId,
        workType,
      };
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to mark completed";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  },
);

// download teacher files
export const downloadTeacherFiles = createAsyncThunk(
  "teacher/downloadTeacherFiles",
  async ({ workId, fileId, workType }, thunkAPI) => {
    try {
      const res = await axiosInstance.get(
        `/teacher/download/${workId}/${fileId}`,
        {
          params: {
            workType,
          },
          responseType: "blob",
        },
      );

      return {
        blob: res.data,
        workId,
        fileId,
        workType,
      };
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to download file";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  },
);

//delete teacher file
export const deleteTeacherFile = createAsyncThunk(
  "teacher/deleteFile",
  async ({ workId, fileId, workType }, thunkAPI) => {
    try {
      const res = await axiosInstance.delete(
        `/teacher/files/${workId}/${fileId}`,
        {
          data: { workType },
        },
      );

      toast.success(res.data.message || "File deleted successfully");
      return { workId, fileId, workType };
    } catch (error) {
      const message = error.response?.data?.message || "Failed to delete file";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  },
);

// get files
export const getFiles = createAsyncThunk(
  "getTeacherFiles",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get(`/teacher/files`);
      return res.data?.data?.files || res.data.data;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch teacher file",
      );
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

// add feedback
export const addFeedback = createAsyncThunk(
  "addFeedback",
  async ({ workId, workType, payload }, thunkAPI) => {
    try {
      const res = await axiosInstance.post(`/teacher/feedback/${workId}`, {
        ...payload,
        workType,
      });

      toast.success(res.data.message || "Feedback posted");
      return {
        workId,
        workType,
        feedback: res.data.data?.feedback || res.data.data || res.data,
      };
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to post feedback";

      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  },
);

// get assign student
// export const getAssignedStudents = createAsyncThunk(
//   "getAssignedStudents",
//   async (_, thunkAPI) => {
//     try {
//       const res = await axiosInstance.get(`/teacher/assigned-student`);
//       return res.data.data?.students || res.data.data || res.data;
//     } catch (error) {
//       toast.error(
//         error.response.data.message || "Failed to fetch assigned students",
//       );
//       return thunkAPI.rejectWithValue(error.response.data.message);
//     }
//   },
// );

export const getAssignedStudents = createAsyncThunk(
  "teacher/getAssignedStudents",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/teacher/assigned-student");

      return res.data?.data?.students || [];
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to fetch assigned students";

      toast.error(message);

      return thunkAPI.rejectWithValue(message);
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
    // fulfilled
    builder.addCase(getTeacherDashboardStats.fulfilled, (state, action) => {
      state.loading = false;
      state.dashboardStats = action.payload;
    });
    // rejected
    builder.addCase(getTeacherDashboardStats.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to fetch dashboard stats";
    });

    // get assigned student
    builder.addCase(getAssignedStudents.pending, (state, action) => {
      state.loading = true;
      state.error = null;
    });
    // fulfilled
    builder.addCase(getAssignedStudents.fulfilled, (state, action) => {
      state.loading = false;
      state.assignedStudents = action.payload || [];
    });

    // rejected
    builder.addCase(getAssignedStudents.rejected, (state, action) => {
      state.error = action.payload || "Failed to fetch assigned students";
      state.loading = false;
    });

    // add feedback
    builder.addCase(addFeedback.fulfilled, (state, action) => {
      const { workId, workType, feedback } = action.payload;
      state.assignedStudents = state.assignedStudents.map((student) => {
        const work = student[workType];

        if (work?._id === workId) {
          return {
            ...student,
            [workType]: {
              ...work,
              feedback: [...(work.feedback || []), feedback],
            },
          };
        }
        return student;
      });
    });

    // delete teacher file
    builder.addCase(deleteTeacherFile.fulfilled, (state, action) => {
      const { workId, fileId } = action.payload;

      state.files = state.files.filter(
        (file) =>
          !(
            file.workId?.toString() === workId?.toString() &&
            file._id?.toString() === fileId?.toString()
          ),
      );
    });

    // mark complete
    builder.addCase(markComplete.fulfilled, (state, action) => {
      const { workId, workType } = action.payload;
      state.assignedStudents = state.assignedStudents.map((student) => {
        const work = student[workType];
        if (work?._id === workId) {
          return {
            ...student,
            [workType]: {
              ...work,
              status: "completed",
            },
          };
        }
        return student;
      });
    });

    // get teacher requests
    // builder.addCase(getTeacherRequests.fulfilled, (state, action) => {
    //   state.list = action.payload || [];
    // });
    builder.addCase(getTeacherRequests.pending, (state) => {
      state.error = null;
    });

    builder.addCase(getTeacherRequests.fulfilled, (state, action) => {
      state.list = action.payload || [];
    });

    builder.addCase(getTeacherRequests.rejected, (state, action) => {
      state.error = action.payload || "Failed to fetch requests";
      state.list = [];
    });

    // get Files
    builder.addCase(getFiles.fulfilled, (state, action) => {
      state.files = action.payload.files || action.payload || [];
    });

    // accept Request
    builder.addCase(acceptRequest.fulfilled, (state, action) => {
      const updatedRequest = action.payload;
      state.list = state.list.map((r) =>
        r._id === updatedRequest._id ? updatedRequest : r,
      );
    });

    // reject Request
    builder.addCase(rejectRequest.fulfilled, (state, action) => {
      const rejectedRequest = action.payload;
      state.list = state.list.filter((r) => r._id !== rejectedRequest._id);
    });

    // delete Request
    builder.addCase(deleteRequest.fulfilled, (state, action) => {
      state.list = state.list.filter(
        (request) => request._id !== action.payload,
      );
    });
  },
});

export default teacherSlice.reducer;
