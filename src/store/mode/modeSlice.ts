import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { ThunkApiConfig, ModeState } from 'api/types';
import type { IRequestState } from '../types';
import { defaultFulfilledCase, defaultPendingCase, defaultRejectedCase } from '../utils';

export type IModeState = IRequestState<ModeState>;

const initialState: IModeState = {
    type: 'idle',
};

export const getModeAsync = createAsyncThunk<ModeState, void, ThunkApiConfig>(
    'mode/getMode',
    async (_: unknown, thunkAPI) => {
        const { data } = await thunkAPI.extra.hoverfly.fetchMode();

        if (data) {
            return data;
        }

        return thunkAPI.rejectWithValue(new Error('Request error'));
    },
);

export const updateModeAsync = createAsyncThunk<ModeState, ModeState, ThunkApiConfig>(
    'mode/updateMode',
    async (formData: ModeState, thunkAPI) => {
        const { data } = await thunkAPI.extra.hoverfly.updateMode(formData);

        if (data) {
            return data;
        }

        return thunkAPI.rejectWithValue(new Error('Request error'));
    },
);

// eslint-disable-next-line @typescript-eslint/ban-types
export const modeSlice = createSlice<IModeState, {}, 'mode'>({
    name: 'mode',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(getModeAsync.pending, defaultPendingCase<IModeState>())
            .addCase(getModeAsync.fulfilled, defaultFulfilledCase<IModeState, ModeState>())
            .addCase(getModeAsync.rejected, defaultRejectedCase<IModeState, ModeState>('Mode'))
            .addCase(updateModeAsync.pending, defaultPendingCase<IModeState>())
            .addCase(updateModeAsync.fulfilled, defaultFulfilledCase<IModeState, ModeState>())
            .addCase(updateModeAsync.rejected, defaultRejectedCase<IModeState, ModeState>('Mode update'));
    },
});

export default modeSlice.reducer;
