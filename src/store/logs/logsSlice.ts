import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { ThunkApiConfig, LogsResponse, LogsRequest } from 'api/types';
import type { IRequestState } from '../types';
import { defaultFulfilledCase, defaultPendingCase, defaultRejectedCase } from '../utils';

export type ILogsSliceState = IRequestState<LogsResponse>;

const initialState: ILogsSliceState = {
    type: 'idle',
};

export const getLogsAsync = createAsyncThunk<LogsResponse, LogsRequest | undefined, ThunkApiConfig>(
    'logs/get',
    async (formData: LogsRequest | undefined, thunkAPI) => {
        const { data } = await thunkAPI.extra.hoverfly.fetchLogs(formData);

        if (data) {
            return data;
        }

        return thunkAPI.rejectWithValue(new Error('Request error'));
    },
);

// eslint-disable-next-line @typescript-eslint/ban-types
export const logsSlice = createSlice<ILogsSliceState, {}, 'logs'>({
    name: 'logs',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(getLogsAsync.pending, defaultPendingCase<ILogsSliceState>())
            .addCase(getLogsAsync.fulfilled, defaultFulfilledCase<ILogsSliceState, LogsResponse | LogsRequest>())
            .addCase(getLogsAsync.rejected, defaultRejectedCase<ILogsSliceState, LogsResponse | LogsRequest>('Logs'));
    },
});

export default logsSlice.reducer;
