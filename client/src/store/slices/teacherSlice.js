import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";


export const getTeacherDashboardStats = createAsyncThunk(
    "getTeacherDashboardStats",
    async (data, thunkAPI) => {
        try {
            const res = await axoiosInstance.get("/teacher/fetch-dashboard-stats");
            return res.data.data?.dashboardStats || res.data.data;
        } catch (error) {
            toast.error
            (error.response.data.message || "Failed to fetch dashboard stats"
            );
            return thunkAPI.rejectWithValue(error.response.data.message);
        }
    }
)

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
  extraReducers: (builder) => {},
});

export default teacherSlice.reducer;
