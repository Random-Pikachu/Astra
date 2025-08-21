import { createSlice } from '@reduxjs/toolkit';

export interface UserRedux {
  _id?: string;
  userCode?: string;
  username?: string;
  email?: string;
  [key: string]: any;
}

const userSlice = createSlice({
  name: 'user',
  initialState: {} as UserRedux,
  reducers: {
    setUserRedux: (_state, action) => action.payload,
    clearUserRedux: () => ({} as UserRedux),
  },
});

export const { setUserRedux, clearUserRedux } = userSlice.actions;
export default userSlice.reducer;