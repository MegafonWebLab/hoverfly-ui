import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { DeleteCache, ThunkApiConfig } from 'api/types';
import { IRequestState, IRequestStateFailed, IRequestStateSuccess } from '../types';

export type ICacheState = IRequestState<DeleteCache>;

const initialState: ICacheState = {
    type: 'idle',
};

export const deleteCacheAsync = createAsyncThunk<DeleteCache, void, ThunkApiConfig>(
    'cache/deleteCache',
    async (_: unknown, thunkAPI) => {
        const { data } = await thunkAPI.extra.hoverfly.fetchDeleteCache();

        if (data) {
            return data;
        }

        return thunkAPI.rejectWithValue(new Error('Request error'));
    },
);

// eslint-disable-next-line @typescript-eslint/ban-types
export const cacheSlice = createSlice<ICacheState, {}, 'cache'>({
    name: 'cache',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(deleteCacheAsync.pending, state => {
                state.type = 'pending';
            })
            .addCase(deleteCacheAsync.fulfilled, (state: IRequestStateSuccess<DeleteCache>, action) => {
                state.type = 'success';
                state.value = action.payload;
            })
            .addCase(deleteCacheAsync.rejected, (state: IRequestStateFailed, action) => {
                state.type = 'failed';
                state.error = action.error.message || '';
            });
    },
});

export default cacheSlice.reducer;
