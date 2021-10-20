import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { JournalResponse, ThunkApiConfig, JournalRequest, JournalSearchDataRequest } from 'api/types';
import type { IRequestState } from '../types';
import { defaultFulfilledCase, defaultPendingCase, defaultRejectedCase } from '../utils';

export type IJournalSliceState = IRequestState<JournalResponse>;

const initialState: IJournalSliceState = {
    type: 'idle',
};

export const getJournalAsync = createAsyncThunk<JournalResponse, JournalRequest | undefined, ThunkApiConfig>(
    'journal/get',
    async (formData: JournalRequest | undefined, thunkAPI) => {
        const { data } = await thunkAPI.extra.hoverfly.fetchJournal(formData);

        if (data) {
            return data;
        }

        return thunkAPI.rejectWithValue(new Error('Request error'));
    },
);

export const deleteJournalAsync = createAsyncThunk<void, void, ThunkApiConfig>(
    'journal/delete',
    async (_: unknown, thunkAPI) => {
        const { data } = await thunkAPI.extra.hoverfly.deleteJournal();

        return data;
    },
);

export const getJournalSearchAsync = createAsyncThunk<JournalResponse, JournalSearchDataRequest, ThunkApiConfig>(
    'journal/search',
    async (search: JournalSearchDataRequest, thunkAPI) => {
        const { data } = await thunkAPI.extra.hoverfly.searchJournal(search);

        if (data) {
            return data;
        }

        return thunkAPI.rejectWithValue(new Error('Request error'));
    },
);

// eslint-disable-next-line @typescript-eslint/ban-types
export const journalSlice = createSlice<IJournalSliceState, {}, 'journal'>({
    name: 'journal',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(getJournalAsync.pending, defaultPendingCase<IJournalSliceState>())
            .addCase(getJournalAsync.fulfilled, defaultFulfilledCase<IJournalSliceState, JournalRequest>())
            .addCase(getJournalAsync.rejected, defaultRejectedCase<IJournalSliceState>())
            .addCase(deleteJournalAsync.pending, defaultPendingCase<IJournalSliceState>())
            .addCase(deleteJournalAsync.fulfilled, defaultFulfilledCase<IJournalSliceState, void>())
            .addCase(deleteJournalAsync.rejected, defaultRejectedCase<IJournalSliceState>())
            .addCase(getJournalSearchAsync.pending, defaultPendingCase<IJournalSliceState>())
            .addCase(
                getJournalSearchAsync.fulfilled,
                defaultFulfilledCase<IJournalSliceState, JournalResponse | JournalSearchDataRequest>(),
            )
            .addCase(getJournalSearchAsync.rejected, defaultRejectedCase<IJournalSliceState>());
    },
});

export default journalSlice.reducer;
