import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { ThunkApiConfig } from 'api/types';
import { loadMainAsync } from 'store/main/mainSlice';
import { getServerStateAsync } from '../serverState/serverStateSlice';

const DISPATCH_SECONDS = 10000;

interface IStatusState {
    value: boolean;
}

const initialState: IStatusState = { value: false };

export const fetchStatusAsync = createAsyncThunk<IStatusState, void, ThunkApiConfig>(
    'status/healthCheck',
    async (_: unknown, thunkAPI) => {
        setTimeout(() => {
            thunkAPI.dispatch(fetchStatusAsync());
        }, DISPATCH_SECONDS);

        await thunkAPI.extra.hoverfly.fetchHealtCheck();
        if (!thunkAPI.getState().status.value) {
            thunkAPI.dispatch(loadMainAsync());
            thunkAPI.dispatch(getServerStateAsync());
        }

        return { value: true };
    },
);

// eslint-disable-next-line @typescript-eslint/ban-types
export const statusSlice = createSlice<IStatusState, {}, 'status'>({
    name: 'status',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(fetchStatusAsync.fulfilled, state => {
                state.value = true;
            })
            .addCase(fetchStatusAsync.rejected, state => {
                state.value = false;
            });
    },
});

export default statusSlice.reducer;
