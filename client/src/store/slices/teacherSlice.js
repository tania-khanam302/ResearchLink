
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

// get teacher dashboard stats
// export const getTeacherDashboardStats = createAsyncThunk(
//   "teacher/getTeacherDashboardStats",
//   async (_, thunkAPI) => {
//     try {
//       const res = await axiosInstance.get(
//         "/teacher/fetch-dashboard-stats"
//       );
//       return res.data.data?.dashboardStats || res.data.data;
//     } catch (error) {
//       toast.error(error.response.data.message || "Failed tp fetch dashboard stats")
//       return thunkAPI.rejectWithValue(error.response?.data.message );
//       // const message =
//       //   error.response?.data?.message ||
//       //   "Failed to fetch dashboard stats";

//       // toast.error(message);

//       // return thunkAPI.rejectWithValue(error.response?.data.message );
//     }
//   }
// );



// Get teacher dashboard stats
export const getTeacherDashboardStats = createAsyncThunk(
  "teacher/getTeacherDashboardStats",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get(
        "/teacher/fetch-dashboard-stats"
      );

      return res.data.data.dashboardStats;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Failed to fetch dashboard stats";

      toast.error(message);

      return thunkAPI.rejectWithValue(message);
    }
  }
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
  },

  reducers: {},

  extraReducers: (builder) => {
    builder
      // .addCase(getTeacherDashboardStats.pending, (state) => {
      //   state.loading = true;
      //   state.error = null;
      // })

      .addCase(getTeacherDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardStats = action.payload;
      })

      // .addCase(getTeacherDashboardStats.rejected, (state, action) => {
      //   state.loading = false;
      //   state.error = action.payload;
      // });
  },
});

export default teacherSlice.reducer;