import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";


// download thesis file
export const downloadThesisFile = createAsyncThunk(
  "thesis/downloadThesisFile",
  async ({ thesisId, fileId }, thunkAPI) => {
    try {
      const res = await axiosInstance.get(
        `/thesis/${thesisId}/files/${fileId}/download`,
        {
          responseType: "blob",
        },
      );

      return {
        blob: res.data,
        thesisId,
        fileId,
      };
    } catch (error) {
      console.error("Thesis file download error:", error);

      toast.error(
        error.response?.data?.message || "Failed to download thesis file",
      );

      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to download thesis file",
      );
    }
  },
);

// thesis slice
const thesisSlice = createSlice({
  name: "thesis",

  initialState: {
    theses: [],
    selected: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(downloadThesisFile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(downloadThesisFile.fulfilled, (state) => {
        state.loading = false;
      })

      .addCase(downloadThesisFile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default thesisSlice.reducer;
