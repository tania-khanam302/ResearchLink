// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import { axiosInstance } from "../../lib/axios";
// import { toast } from "react-toastify";


// // create Deadline
// export const createDeadline = createAsyncThunk(
//   "createDeadline",
//   async ({ id, data }, thunkAPI) => {
//     try {
//       const res = await axiosInstance.post(
//         `/deadline/create-deadline/${id}`,
//         data,
//       );
//       toast.success(res.data.message || "Deadline updated");
//       return res.data.data?.deadline || res.data.data || res.data;
//     } catch (error) {
//       toast.error(
//         error.response.data.message || "Failed to update or create deadline",
//       );
//       return thunkAPI.rejectWithValue(error.response.data.message);
//     }
//   },
// );

// const deadlineSlice = createSlice({
//   name: "deadline",
//   initialState: {
//     deadlines: [],
//     nearby: [],
//     selected: null,
//     loading: false,
//     error: null,
//   },
//   reducers: {},
//   extraReducers: (builder) => {
//     builder.addCase(createDeadline.fulfilled, (state, action) => {
//       const item = action.payload;
//       if (item) state.deadlines.push(item);
//     });
//   },
// });

// export default deadlineSlice.reducer;



import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

 
export const createDeadline = createAsyncThunk(
  "deadline/createDeadline",

  async (data, thunkAPI) => {
    try {
      const res = await axiosInstance.post(
        "/deadline/create-deadline",
        data
      );

      toast.success(
        res.data.message ||
          "Deadline created successfully"
      );

      return (
        res.data.data?.deadline ||
        res.data.data ||
        res.data
      );
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Failed to create deadline";

      toast.error(message);

      return thunkAPI.rejectWithValue(message);
    }
  }
);


export const getTeacherDeadlines = createAsyncThunk(
  "deadline/getTeacherDeadlines",

  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get(
        "/deadline/my-deadlines"
      );

      return (
        res.data.data?.deadlines || []
      );
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Failed to load deadlines";

      toast.error(message);

      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getTeacherResearch = createAsyncThunk(
  "deadline/getTeacherResearch",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/deadline/my-research");
      return res.data.data || { projects: [], theses: [] };
    } catch (error) {
      const message = error.response?.data?.message || "Failed to load research";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  },
);


export const getStudentDeadlines = createAsyncThunk(
  "deadline/getStudentDeadlines",

  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get(
        "/deadline/student-deadlines"
      );

      return (
        res.data.data?.deadlines || []
      );
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Failed to load student deadlines";

      toast.error(message);

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// File delete
export const submitDeadline = createAsyncThunk(
  "deadline/submitDeadline",

  async ({ id, formData }, thunkAPI) => {
    try {
      const res = await axiosInstance.post(
        `/deadline/submit/${id}`,
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      toast.success(
        res.data.message ||
          "Your work has been submitted successfully."
      );

      return (
        res.data.data?.deadline ||
        res.data.data ||
        res.data
      );
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Failed to submit work";

      toast.error(message);

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Link delete
export const deleteDeadlineSubmissionLink =
  createAsyncThunk(
    "deadline/deleteDeadlineSubmissionLink",

    async (
      {
        deadlineId,
        submissionId,
        linkId,
      },
      thunkAPI
    ) => {
      try {
        const res =
          await axiosInstance.delete(
            `/deadline/submit/${deadlineId}/submission/${submissionId}/link/${linkId}`
          );

        toast.success(
          res.data.message ||
            "Link deleted successfully"
        );

        return (
          res.data.data?.deadline ||
          res.data.data ||
          res.data
        );
      } catch (error) {
        const message =
          error.response?.data?.message ||
          "Failed to delete link";

        toast.error(message);

        return thunkAPI.rejectWithValue(
          message
        );
      }
    }
  );
export const deleteDeadlineSubmissionFile =
  createAsyncThunk(
    "deadline/deleteDeadlineSubmissionFile",

    async (
      {
        deadlineId,
        submissionId,
        fileId,
      },
      thunkAPI
    ) => {
      try {
        const res =
          await axiosInstance.delete(
            `/deadline/submit/${deadlineId}/submission/${submissionId}/file/${fileId}`
          );

        toast.success(
          res.data.message ||
            "File deleted successfully"
        );

        return (
          res.data.data?.deadline ||
          res.data.data ||
          res.data
        );
      } catch (error) {
        const message =
          error.response?.data?.message ||
          "Failed to delete file";

        toast.error(message);

        return thunkAPI.rejectWithValue(
          message
        );
      }
    }
  );

export const reviewDeadline = createAsyncThunk(
  "deadline/reviewDeadline",

  async ({ id, feedback }, thunkAPI) => {
    try {
      const res = await axiosInstance.patch(
        `/deadline/review/${id}`,
        {
          teacherFeedback: feedback,
        }
      );

      toast.success(
        res.data.message ||
          "Submission reviewed successfully"
      );

      return (
        res.data.data?.deadline ||
        res.data.data ||
        res.data
      );
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Failed to review submission";

      toast.error(message);

      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const replyToDeadlineFeedback = createAsyncThunk(
  "deadline/replyToDeadlineFeedback",

  async (
    {
      deadlineId,
      submissionId,
      studentReply,
    },
    thunkAPI
  ) => {
    try {
      const res = await axiosInstance.patch(
        `/deadline/reply/${deadlineId}/submission/${submissionId}`,
        {
          studentReply,
        }
      );

      toast.success(
        res.data.message || "Reply sent successfully"
      );

      return (
        res.data.data?.deadline ||
        res.data.data ||
        res.data
      );
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Failed to send reply";

      toast.error(message);

      return thunkAPI.rejectWithValue(message);
    }
  }
);


const deadlineSlice = createSlice({
  name: "deadline",

  initialState: {
    deadlines: [],

    studentDeadlines: [],

    research: { projects: [], theses: [] },

    selected: null,

    loading: false,

    submitting: false,

    reviewing: false,

    error: null,
  },

  reducers: {
  
    clearDeadlineError: (state) => {
      state.error = null;
    },

 
    clearSelectedDeadline: (state) => {
      state.selected = null;
    },

   
    setSelectedDeadline: (state, action) => {
      state.selected = action.payload;
    },
  },

  extraReducers: (builder) => {
 
    builder
      .addCase(
        createDeadline.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        createDeadline.fulfilled,
        (state, action) => {
          state.loading = false;

          if (action.payload) {
            // Prevent duplicate deadline
            const exists =
              state.deadlines.some(
                (item) =>
                  item._id ===
                  action.payload._id
              );

            if (!exists) {
              state.deadlines.push(
                action.payload
              );
            }

            state.selected =
              action.payload;
          }
        }
      )

      .addCase(
        createDeadline.rejected,
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );


    builder
      .addCase(getTeacherResearch.fulfilled, (state, action) => {
        state.research = action.payload || { projects: [], theses: [] };
      })
      .addCase(getTeacherResearch.rejected, (state, action) => {
        state.error = action.payload;
      });

    builder
      .addCase(
        getTeacherDeadlines.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        getTeacherDeadlines.fulfilled,
        (state, action) => {
          state.loading = false;

          state.deadlines =
            action.payload || [];
        }
      )

      .addCase(
        getTeacherDeadlines.rejected,
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );


    builder
      .addCase(
        getStudentDeadlines.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        getStudentDeadlines.fulfilled,
        (state, action) => {
          state.loading = false;

          state.studentDeadlines =
            action.payload || [];
        }
      )

      .addCase(
        getStudentDeadlines.rejected,
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );

    builder
      .addCase(
        submitDeadline.pending,
        (state) => {
          state.submitting = true;
          state.error = null;
        }
      )

      .addCase(
        submitDeadline.fulfilled,
        (state, action) => {
          state.submitting = false;

          const updated =
            action.payload;

          if (!updated?._id) {
            return;
          }

       
          state.studentDeadlines =
            state.studentDeadlines.map(
              (item) =>
                item._id === updated._id
                  ? updated
                  : item
            );
          state.deadlines =
            state.deadlines.map(
              (item) =>
                item._id === updated._id
                  ? updated
                  : item
            );

     
          state.selected = updated;
        }
      )

      .addCase(
        submitDeadline.rejected,
        (state, action) => {
          state.submitting = false;
          state.error = action.payload;
        }
      );

  
    builder
      .addCase(
        reviewDeadline.pending,
        (state) => {
          state.reviewing = true;
          state.error = null;
        }
      )

      .addCase(
        reviewDeadline.fulfilled,
        (state, action) => {
          state.reviewing = false;

          const updated =
            action.payload;

          if (!updated?._id) {
            return;
          }

          
          state.deadlines =
            state.deadlines.map(
              (item) =>
                item._id === updated._id
                  ? updated
                  : item
            );

        
          state.studentDeadlines =
            state.studentDeadlines.map(
              (item) =>
                item._id === updated._id
                  ? updated
                  : item
            );

        
          state.selected = updated;
        }
      )

      .addCase(
        reviewDeadline.rejected,
        (state, action) => {
          state.reviewing = false;
          state.error = action.payload;
        }
      );
builder
  .addCase(
    replyToDeadlineFeedback.pending,
    (state) => {
      state.error = null;
    }
  )

  .addCase(
    replyToDeadlineFeedback.fulfilled,
    (state, action) => {
      const updated = action.payload;

      if (!updated?._id) {
        return;
      }

      state.studentDeadlines =
        state.studentDeadlines.map(
          (item) =>
            item._id === updated._id
              ? updated
              : item
        );

      state.deadlines =
        state.deadlines.map(
          (item) =>
            item._id === updated._id
              ? updated
              : item
        );

      state.selected = updated;
    }
  )

  .addCase(
    replyToDeadlineFeedback.rejected,
    (state, action) => {
      state.error = action.payload;
    }
  );

builder
  .addCase(
    deleteDeadlineSubmissionFile.fulfilled,
    (state, action) => {
      const updated =
        action.payload;

      if (!updated?._id) {
        return;
      }

      state.studentDeadlines =
        state.studentDeadlines.map(
          (item) =>
            item._id === updated._id
              ? updated
              : item
        );

      state.deadlines =
        state.deadlines.map(
          (item) =>
            item._id === updated._id
              ? updated
              : item
        );

      state.selected = updated;
    }
  )

  .addCase(
    deleteDeadlineSubmissionFile.rejected,
    (state, action) => {
      state.error = action.payload;
    }
  )

  .addCase(
    deleteDeadlineSubmissionLink.fulfilled,
    (state, action) => {
      const updated =
        action.payload;

      if (!updated?._id) {
        return;
      }

      state.studentDeadlines =
        state.studentDeadlines.map(
          (item) =>
            item._id === updated._id
              ? updated
              : item
        );

      state.deadlines =
        state.deadlines.map(
          (item) =>
            item._id === updated._id
              ? updated
              : item
        );

      state.selected = updated;
    }
  )

  .addCase(
    deleteDeadlineSubmissionLink.rejected,
    (state, action) => {
      state.error = action.payload;
    }
  );

  },
});


export const {
  clearDeadlineError,
  clearSelectedDeadline,
  setSelectedDeadline,
} = deadlineSlice.actions;


export default deadlineSlice.reducer;
