import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { ThunkApiConfig } from 'api/types';
import { loadMainAsync } from 'store/main/mainSlice';
import { getServerStateAsync } from '../serverState/serverStateSlice';
import { getSimulationAsync } from '../simulation/simulationSlice';

const DISPATCH_SECONDS = 5000;

interface IStatusState {
    value: boolean;
    type: 'idle' | 'success' | 'error';
}

const initialState: IStatusState = { value: false, type: 'idle' };

export const fetchStatusAsync = createAsyncThunk<IStatusState, void, ThunkApiConfig>(
    'status/healthCheck',
    async (_: unknown, thunkAPI) => {
        setTimeout(() => {
            thunkAPI.dispatch(fetchStatusAsync());
        }, DISPATCH_SECONDS);

        await thunkAPI.extra.hoverfly.fetchHealtCheck();

        if (!thunkAPI.getState().status.value) {
            await thunkAPI.dispatch(loadMainAsync());
            const { main } = thunkAPI.getState();

            if (window.location.pathname !== '/login' && main.type === 'success') {
                thunkAPI.dispatch(getServerStateAsync());
                thunkAPI.dispatch(getSimulationAsync());
            }
        }

        return { value: true, type: 'success' };
    },
);

// eslint-disable-next-line @typescript-eslint/ban-types
export const statusSlice = createSlice<IStatusState, {}, 'status'>({
    name: 'status',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(fetchStatusAsync.fulfilled, (state, action) => {
                state.value = action.payload.value;
                state.type = 'success';
            })
            .addCase(fetchStatusAsync.rejected, state => {
                state.value = false;
                state.type = 'error';
            });
    },
});

export default statusSlice.reducer;
