import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { MainInfo } from '../../api/hoverfly/types';
import type { ThunkApiConfig } from '../../api/types';

export interface IMainStateIdle {
    type: 'idle';
}
export interface IMainStatePending {
    type: 'pending';
}
export interface IMainStateFailed {
    error: string;
    type: 'failed';
}
export interface IMainStateSuccess {
    value: MainInfo;
    type: 'success';
}

export type IMainState = IMainStateSuccess | IMainStateIdle | IMainStatePending | IMainStateFailed;

const initialState: IMainState = {
    type: 'idle',
};

export const loadMainAsync = createAsyncThunk<MainInfo, void, ThunkApiConfig>(
    'main/fetchMain',
    async (_: unknown, thunkAPI) => {
        const { data } = await thunkAPI.extra.hoverfly.fetchMainInfo();

        if (data) {
            return data;
        }

        return thunkAPI.rejectWithValue(new Error('not response'));
    },
);

// eslint-disable-next-line @typescript-eslint/ban-types
export const mainSlice = createSlice<IMainState, {}, 'main'>({
    name: 'main',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(loadMainAsync.pending, (state: IMainStatePending) => {
                state.type = 'pending';
            })
            .addCase(loadMainAsync.fulfilled, (state: IMainStateSuccess, action) => {
                state.type = 'success';
                state.value = action.payload;
            })
            .addCase(loadMainAsync.rejected, (state: IMainStateFailed, action) => {
                state.type = 'failed';
                state.error = action.error.message || '';
            });
    },
});

export default mainSlice.reducer;
