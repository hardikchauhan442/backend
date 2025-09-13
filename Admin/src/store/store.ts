import { configureStore } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import settingsReducer from "./settingsSlice";
import userReducer from "./userSlice";

// Configure the store with the reducers
const store = configureStore({
  reducer: {
    user: userReducer,
    settings: settingsReducer,
  },
  // Add middleware configuration if needed
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable serializable check for non-serializable values if needed
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;

// Inferred type: { user: UserState, settings: SettingsState }
export type AppDispatch = typeof store.dispatch;

// Export a hook that can be reused to resolve types
export const useAppDispatch = () => useDispatch<AppDispatch>();

export default store;
