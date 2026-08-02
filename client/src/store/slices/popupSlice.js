import { createSlice } from "@reduxjs/toolkit";

const popupSlice = createSlice({
  name: "popup",
  initialState: {
    isCreateStudentModalOpen: false,
    isCreateTeacherModalOpen: false,
    isCreateCoAdminModalOpen: false, 
  },
  reducers: {
    // student toggle model
    toggleStudentModal: (state) => {
      state.isCreateStudentModalOpen = !state.isCreateStudentModalOpen;
    },

    // teacher toggle model
    toggleTeacherModal: (state) => {
      state.isCreateTeacherModalOpen = !state.isCreateTeacherModalOpen;
    },

    // co-admin toggle model
  toggleCoAdminModal: (state) => {
    state.isCreateCoAdminModalOpen =
      !state.isCreateCoAdminModalOpen;
  },
     
  },
});

export const {
    toggleStudentModal,
  toggleTeacherModal,
  toggleCoAdminModal,
}= popupSlice.actions;

export default popupSlice.reducer;
