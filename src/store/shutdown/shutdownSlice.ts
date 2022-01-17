import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { ThunkApiConfig } from 'api/types';
import { showNotification } from '../../utils';
import type { IRequestState, IRequestStateFailed, IRequestStateSuccess } from '../types';

export type IShutdownState = IRequestState<void>;

const initialState: IShutdownState = {
    type: 'idle',
};

const SUCCESS_REQUST_STATUS = 200;

export const deleteShutdownAsync = createAsyncThunk<void, void, ThunkApiConfig>(
    'shutdown/deleteShutdown',
    async (_: unknown, thunkAPI) => {
        const { status, data } = await thunkAPI.extra.hoverfly.fetchShutdown();

        if (status === SUCCESS_REQUST_STATUS) {
            return data;
        }

        return thunkAPI.rejectWithValue(new Error('Server already shutdown'));
    },
);

// eslint-disable-next-line @typescript-eslint/ban-types
export const shutdownSlice = createSlice<IShutdownState, {}, 'shutdown'>({
    name: 'shutdown',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(deleteShutdownAsync.pending, state => {
                state.type = 'pending';
            })
            .addCase(deleteShutdownAsync.fulfilled, (state: IRequestStateSuccess<void>, action) => {
                showNotification('Shutdown', '', false);
                state.type = 'success';
                state.value = action.payload;
            })
            .addCase(deleteShutdownAsync.rejected, (state: IRequestStateFailed, action) => {
                showNotification(`Shutdown ${action.error.name?.toLowerCase()}`.trim(), action.error.message);
                state.type = 'failed';
                state.error = action.error.message || '';
            });
    },
});

export default shutdownSlice.reducer;
