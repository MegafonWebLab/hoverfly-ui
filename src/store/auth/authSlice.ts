import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { CaseReducer } from '@reduxjs/toolkit/src/createReducer';
import type { AuthRequest, AuthResponse, ThunkApiConfig } from 'api/types';
import { TOKEN_NAME, USER_NAME } from 'constants/cookie';
import { getCookie, setCookie, showNotification } from 'utils';
import type { IRequestState, IRequestStateFailed, IRequestStateSuccess } from '../types';

export type IAuthState<T = IRequestState<AuthResponse>> = {
    rd: T;
    isNeedAuth: boolean;
    username?: string;
};

const initialState: IAuthState = {
    rd: { type: 'idle' },
    isNeedAuth: false,
};

export const getAuthorizeAsync = createAsyncThunk<AuthResponse, AuthRequest, ThunkApiConfig>(
    'auth/post',
    async (formData: AuthRequest, thunkAPI) => {
        const { data } = await thunkAPI.extra.hoverfly.getAuth(formData);

        if (data) {
            setCookie(TOKEN_NAME, data.token);
            setCookie(USER_NAME, formData.username);

            return data;
        }

        return thunkAPI.rejectWithValue(new Error('Request error'));
    },
);

// eslint-disable-next-line @typescript-eslint/ban-types
export const authSlice = createSlice<
    IAuthState,
    { needAuth: CaseReducer<IAuthState>; setUserName: CaseReducer<IAuthState> },
    'auth'
>({
    name: 'auth',
    initialState,
    reducers: {
        needAuth(state: IAuthState) {
            state.isNeedAuth = true;
            state.username = '';
        },
        setUserName(state: IAuthState) {
            state.username = getCookie(USER_NAME) || '';
        },
    },
    extraReducers: builder => {
        builder
            .addCase(getAuthorizeAsync.pending, state => {
                state.rd.type = 'pending';
            })
            .addCase(getAuthorizeAsync.fulfilled, (state: IAuthState<IRequestStateSuccess<AuthResponse>>, action) => {
                state.rd.type = 'success';
                state.username = action.meta.arg.username;
                state.rd.value = action.payload;
                state.isNeedAuth = false;
            })
            .addCase(getAuthorizeAsync.rejected, (state: IAuthState<IRequestStateFailed>, action) => {
                showNotification(`Auth ${action.error.name?.toLowerCase()}`.trim(), action.error.message);
                state.rd.type = 'failed';
                state.rd.error = action.error.message || '';
            });
    },
});

export const { needAuth, setUserName } = authSlice.actions;

export default authSlice.reducer;
