import { authSlice } from '@/stores/auth/slice';
import * as selector from '@/stores/auth/selector';

export const authReducer = authSlice.reducer;
export const { setAuth, setUser } = authSlice.actions;
export const { authSelector, userIdSelector, isLoginSelector } = selector;
