import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";



// create-student
export const createStudent = createAsyncThunk(
  "createStudent",
  async (data, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/admin/create-student", data);
      toast.success(res.data.message || "Student create successfully");
      return res.data.data.user;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create student");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

// update-student
export const updateStudent = createAsyncThunk(
  "updateStudent",
  async ({ id, data }, thunkAPI) => {
    try {
      const res = await axiosInstance.put(`/admin/update-student/${id}`, data);
      toast.success(res.data.message || "Student update successfully");
      return res.data.data.user;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update student");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

// delete-student
export const deleteStudent = createAsyncThunk(
  "deleteStudent",
  async (id, thunkAPI) => {
    try {
      const res = await axiosInstance.delete(`/admin/delete-student/${id}`);
      toast.success(res.data.message || "Student deleted successfully");
      return id;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete student");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

// get-all-users
export const getAllUsers = createAsyncThunk(
  "getAllUsers",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get(`/admin/users`);
      console.log(res);
      return res.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch users");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

// create-teacher
export const createTeacher = createAsyncThunk(
  "createTeacher",
  async (data, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/admin/create-teacher", data);
      toast.success(res.data.message || "Teacher create successfully");
      return res.data.data.user;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create Teacher");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

// update-teacher
export const updateTeacher = createAsyncThunk(
  "updateTeacher",
  async ({ id, data }, thunkAPI) => {
    try {
      const res = await axiosInstance.put(`/admin/update-teacher/${id}`, data);
      toast.success(res.data.message || "Teacher update successfully");
      return res.data.data.user;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update Teacher");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

// delete-teacher
export const deleteTeacher = createAsyncThunk(
  "deleteTeacher",
  async (id, thunkAPI) => {
    try {
      const res = await axiosInstance.delete(`/admin/delete-teacher/${id}`);
      toast.success(res.data.message || "Teacher deleted successfully");
      return id;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete Teacher");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

// create co-admin
export const createCoAdmin = createAsyncThunk(
  "createCoAdmin",
  async (data, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/admin/create-coadmin", data);
      toast.success(res.data.message || "Co-Admin created successfully");
      return res.data.data.user;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create Co-Admin");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

// update co-admin
export const updateCoAdmin = createAsyncThunk(
  "updateCoAdmin",
  async ({ id, data }, thunkAPI) => {
    try {
      const res = await axiosInstance.put(`/admin/update-coadmin/${id}`, data);
      toast.success(res.data.message || "Co-Admin updated successfully");
      return res.data.data.user;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update Co-Admin");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

// delete co-admin
export const deleteCoAdmin = createAsyncThunk(
  "deleteCoAdmin",
  async (id, thunkAPI) => {
    try {
      const res = await axiosInstance.delete(`/admin/delete-coadmin/${id}`);
      toast.success(res.data.message || "Co-Admin deleted successfully");
      return id;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete Co-Admin");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

// get all theses
export const getAllTheses = createAsyncThunk(
  "getAllTheses",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/admin/theses");
      return res.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch theses");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

// get all project
export const getAllProjects = createAsyncThunk(
  "getAllProjects",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/admin/projects");
      return res.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch projects");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

//Dashboard Stats
export const getDashboardStats = createAsyncThunk(
  "getDashboardStats",
  async (__dirname, thunkAPI) => {
    try {
      const res = await axiosInstance.get(`/admin/fetch-dashboard-stats`);
      return res.data.data;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch dashboard stats",
      );
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  },
);

// assign supervisor
export const assignSupervisor = createAsyncThunk(
  "assignSupervisor",
  async (data, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/admin/assign-supervisor", data);
      toast.success(res.data.message);
      return res.data.data;
    } catch (error) {
      toast.error(error.response.data.message || "Failed to assign supervisor");
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  },
);

// approve project
export const approveProject = createAsyncThunk(
  "approveProject",
  async (id, thunkAPI) => {
    try {
      const res = await axiosInstance.put(`/admin/project/${id}`, {
        status: "approved",
      });
      toast.success(res.data.message || "Project approved successfully");
      return id;
    } catch (error) {
      toast.error(error.response.data.message || "Failed to approved project");
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  },
);

// reject project
export const rejectProject = createAsyncThunk(
  "rejectProject",
  async (id, thunkAPI) => {
    try {
      const res = await axiosInstance.put(`/admin/project/${id}`, {
        status: "rejected",
      });
      toast.success(res.data.message || "Project rejected successfully");
      return id;
    } catch (error) {
      toast.error(error.response.data.message || "Failed to reject project");
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  },
);

// delete project
export const deleteProject = createAsyncThunk(
  "deleteProject",
  async (id, thunkAPI) => {
    try {
      const res = await axiosInstance.delete(`/admin/project/${id}`);

      toast.success(res.data.message || "Project deleted successfully");

      return id;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete project");

      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to delete project",
      );
    }
  },
);

// get project
export const getProject = createAsyncThunk(
  "getProject",
  async (id, thunkAPI) => {
    try {
      const res = await axiosInstance.get(`/admin/project/${id}`);
      return res.data?.data?.project || res.data?.data || res.data;
    } catch (error) {
      toast.error(error.response.data.message || "Failed to fetch project");
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  },
);

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    students: [],
    teachers: [],
    theses: [],
    projects: [],
    users: [],
    stats: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // create student
      .addCase(createStudent.fulfilled, (state, action) => {
        if (state.users) state.users.unshift(action.payload);
      })

      // update Student
      .addCase(updateStudent.fulfilled, (state, action) => {
        if (state.users) {
          state.users = state.users.map((u) =>
            u._id === action.payload._id ? { ...u, ...action.payload } : u,
          );
        }
      })

      // delete Student
      .addCase(deleteStudent.fulfilled, (state, action) => {
        if (state.users) {
          state.users = state.users.filter((u) => u._id !== action.payload);
        }
      })
      // get all users
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.users = action.payload.users;
      })

      // get all projects
      .addCase(getAllProjects.fulfilled, (state, action) => {
        state.projects = action.payload.projects;
      })

      // get all theses
      .addCase(getAllTheses.fulfilled, (state, action) => {
        state.theses = action.payload.theses;
      })

      // create teacher
      .addCase(createTeacher.fulfilled, (state, action) => {
        if (state.users) state.users.unshift(action.payload);
      })

      // update teacher
      .addCase(updateTeacher.fulfilled, (state, action) => {
        if (state.users) {
          state.users = state.users.map((u) =>
            u._id === action.payload._id ? { ...u, ...action.payload } : u,
          );
        }
      })

      // delete teacher
      .addCase(deleteTeacher.fulfilled, (state, action) => {
        if (state.users) {
          state.users = state.users.filter((u) => u._id !== action.payload);
        }
      })

      // create co-admin
      .addCase(createCoAdmin.fulfilled, (state, action) => {
        state.users.unshift(action.payload);
      })

      // update co-admin
      .addCase(updateCoAdmin.fulfilled, (state, action) => {
        state.users = state.users.map((u) =>
          u._id === action.payload._id ? action.payload : u,
        );
      })

      // delete co-admin
      .addCase(deleteCoAdmin.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u._id !== action.payload);
      })

      // dashboard stats
      .addCase(getDashboardStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })

      // approved project
      .addCase(approveProject.fulfilled, (state, action) => {
        const projectId = action.payload;
        state.projects = state.projects.map((p) =>
          p._id === projectId ? { ...p, status: "approved" } : p,
        );
      })

      // reject project
      .addCase(rejectProject.fulfilled, (state, action) => {
        const projectId = action.payload;
        state.projects = state.projects.map((p) =>
          p._id === projectId ? { ...p, status: "rejected" } : p,
        );
      })

      // delete project
      .addCase(deleteProject.fulfilled, (state, action) => {
        const projectId = action.payload;
        state.projects = state.projects.filter((p) => p._id !== projectId);
      });
  },
});

export default adminSlice.reducer;
