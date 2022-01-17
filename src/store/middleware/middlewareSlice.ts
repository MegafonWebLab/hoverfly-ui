import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { Middleware, ThunkApiConfig } from 'api/types';
import type { IRequestState } from '../types';
import { defaultFulfilledCase, defaultPendingCase, defaultRejectedCase } from '../utils';

export type IMiddlewareState = IRequestState<Middleware>;

const initialState: IMiddlewareState = {
    type: 'idle',
};

export const getMiddlewareAsync = createAsyncThunk<Middleware, void, ThunkApiConfig>(
    'middleware/get',
    async (_: unknown, thunkAPI) => {
        const {
            extra: { hoverfly },
        } = thunkAPI;
        const { data } = await hoverfly.fetchMiddleware();

        if (data) {
            return data;
        }

        return thunkAPI.rejectWithValue(new Error('Request error'));
    },
);

export const updateMiddlewareAsync = createAsyncThunk<Middleware, Middleware, ThunkApiConfig>(
    'middleware/update',
    async (content: Middleware, thunkAPI) => {
        const { data } = await thunkAPI.extra.hoverfly.updateMiddleware(content);
        if (data) {
            return data;
        }

        return thunkAPI.rejectWithValue(new Error('Request error'));
    },
);

// eslint-disable-next-line @typescript-eslint/ban-types
export const middlewareSlice = createSlice<IMiddlewareState, {}, 'middleware'>({
    name: 'middleware',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(getMiddlewareAsync.pending, defaultPendingCase<IMiddlewareState>())
            .addCase(getMiddlewareAsync.fulfilled, defaultFulfilledCase<IMiddlewareState, Middleware>())
            .addCase(getMiddlewareAsync.rejected, defaultRejectedCase<IMiddlewareState, Middleware>('Middleware'))
            .addCase(updateMiddlewareAsync.pending, defaultPendingCase<IMiddlewareState>())
            .addCase(updateMiddlewareAsync.fulfilled, defaultFulfilledCase<IMiddlewareState, Middleware>())
            .addCase(
                updateMiddlewareAsync.rejected,
                defaultRejectedCase<IMiddlewareState, Middleware>('Middleware update'),
            );
    },
});

export default middlewareSlice.reducer;
