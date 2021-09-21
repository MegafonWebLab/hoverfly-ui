import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { ThunkApiConfig, UpstreamProxy } from 'api/types';
import type { IRequestState } from '../types';
import { defaultFulfilledCase, defaultPendingCase, defaultRejectedCase } from '../utils';

export type IUpstreamProxyState = IRequestState<UpstreamProxy>;

const initialState: IUpstreamProxyState = {
    type: 'idle',
};

export const getUpstreamProxyAsync = createAsyncThunk<UpstreamProxy, void, ThunkApiConfig>(
    'upstreamProxy/get',
    async (_: unknown, thunkAPI) => {
        const { data } = await thunkAPI.extra.hoverfly.fetchUpstreamProxy();

        if (data) {
            return data;
        }

        return thunkAPI.rejectWithValue(new Error('Request error'));
    },
);

// eslint-disable-next-line @typescript-eslint/ban-types
export const middlewareSlice = createSlice<IUpstreamProxyState, {}, 'upstreamProxy'>({
    name: 'upstreamProxy',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(getUpstreamProxyAsync.pending, defaultPendingCase<IUpstreamProxyState>())
            .addCase(getUpstreamProxyAsync.fulfilled, defaultFulfilledCase<IUpstreamProxyState, UpstreamProxy>())
            .addCase(getUpstreamProxyAsync.rejected, defaultRejectedCase<IUpstreamProxyState>());
    },
});

export default middlewareSlice.reducer;
