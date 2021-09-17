import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ThunkApiConfig, ModeState } from 'api/types';
import type { IRequestState } from '../types';

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

const pendingCase = (state: IModeState): void => {
    state.type = 'pending';
};

const fulfilledCase = (
    state: IModeState,
    action: PayloadAction<ModeState, string, { arg: ModeState | void; requestId: string; requestStatus: 'fulfilled' }>,
): void => {
    state.type = 'success';
    if (state.type === 'success') {
        state.value = action.payload;
    }
};

const rejectedCase = (state: IModeState) => {
    state.type = 'failed';
};

// eslint-disable-next-line @typescript-eslint/ban-types
export const modeSlice = createSlice<IModeState, {}, 'mode'>({
    name: 'mode',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(getModeAsync.pending, pendingCase)
            .addCase(getModeAsync.fulfilled, fulfilledCase)
            .addCase(getModeAsync.rejected, rejectedCase)
            .addCase(updateModeAsync.pending, pendingCase)
            .addCase(updateModeAsync.fulfilled, fulfilledCase)
            .addCase(updateModeAsync.rejected, rejectedCase);
    },
});

export default modeSlice.reducer;
