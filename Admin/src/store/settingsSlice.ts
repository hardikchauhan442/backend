import { createSlice } from "@reduxjs/toolkit";

interface SettingsState {
  primaryColor: string;
  secondaryColor: string;
}

const initialState: SettingsState = {
  primaryColor: "#1890ff",
  secondaryColor: "#ff4d4f",
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setPrimaryColor(state, action) {
      state.primaryColor = action.payload;
    },
    setSecondaryColor(state, action) {
      state.secondaryColor = action.payload;
    },
  },
});

export const { setPrimaryColor, setSecondaryColor } = settingsSlice.actions;
export default settingsSlice.reducer;
