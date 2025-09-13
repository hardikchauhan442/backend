import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface MasterData {
  id: string;
  name: string;
  code: string;
  description: string | null;
  isActive: boolean;
  isDisplay: boolean;
  parentId: string | null;
  parentCode: string | null;
  likeKeyword: string[];
  imageUrl: string | null;
  isDefault: boolean;
  sequence: number | null;
  groupName: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  deletedBy: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  subMasters?: MasterData[];
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  roleId: string;
  phone: string | null;
  isActive: boolean;
  createdBy: string | null;
  updatedBy: string | null;
  deletedBy: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  roleData: {
    id: string;
    name: string;
    code: string;
    // ... other roleData fields
  };
  token: string;
  key: string;
  master: MasterData[];
  is_subscribed: boolean;
}

interface UserState {
  isAuthenticated: boolean;

  userInfo: Omit<UserData, "token" | "key" | "master"> | null;
  token: string | null;
  key: string | null;
  masters: MasterData[];
}

const initialState: UserState = {
  isAuthenticated: false,
  userInfo: null,
  token: null,
  key: null,
  masters: [],
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login(state, action: PayloadAction<UserData>) {
      const { token, key, master, ...userInfo } = action.payload;

      state.isAuthenticated = true;
      state.userInfo = userInfo;
      state.token = token;
      state.key = key;
      state.masters = master;

      // Store in localStorage for persistence
      if (typeof window !== "undefined") {
        localStorage.setItem("authToken", token);
        localStorage.setItem("userKey", key);
        localStorage.setItem("userData", JSON.stringify(userInfo));
        localStorage.setItem("masters", JSON.stringify(master));
      }
    },
    logout(state) {
      state.isAuthenticated = false;
      state.userInfo = null;
      state.token = null;
      state.key = null;
      state.masters = [];

      // Clear localStorage on logout
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userKey");
        localStorage.removeItem("userData");
        localStorage.removeItem("masters");
      }
    },
    initializeAuth(state) {
      if (typeof window !== "undefined") {
        try {
          const token = localStorage.getItem("authToken");
          const userData = localStorage.getItem("userData");
          const masters = localStorage.getItem("masters");

          if (token && userData) {
            try {
              const parsedUserData = JSON.parse(userData);
              state.isAuthenticated = true;
              state.token = token;
              state.key = localStorage.getItem("userKey");
              state.userInfo = parsedUserData;
              state.masters = masters ? JSON.parse(masters) : [];
            } catch (error) {
              console.error("Failed to parse user data:", error);
              // Clear invalid data
              localStorage.removeItem("authToken");
              localStorage.removeItem("userKey");
              localStorage.removeItem("userData");
              localStorage.removeItem("masters");
            }
          }
        } catch (error) {
          console.error("Error initializing auth:", error);
        }
      }
    },
  },
});

export const { login, logout, initializeAuth } = userSlice.actions;
export default userSlice.reducer;
