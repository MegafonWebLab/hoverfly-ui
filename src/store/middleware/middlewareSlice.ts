import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Middleware, ThunkApiConfig } from 'api/types';
import type { IRequestState } from '../types';

export type IMiddlewareState = IRequestState<Middleware>;

const initialState: IMiddlewareState = {
    type: 'idle',
};

export const getMiddlewareAsync = createAsyncThunk<Middleware, void, ThunkApiConfig>(
    'middleware/get',
    async (_: unknown, thunkAPI) => {
        const { data } = await thunkAPI.extra.hoverfly.fetchMiddleware();

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

const pendingCase = (state: IMiddlewareState): void => {
    state.type = 'pending';
};

const fulfilledCase = (
    state: IMiddlewareState,
    action: PayloadAction<
        Middleware,
        string,
        { arg: Middleware | void; requestId: string; requestStatus: 'fulfilled' }
    >,
): void => {
    state.type = 'success';
    if (state.type === 'success') {
        state.value = action.payload;
    }
};

const rejectedCase = (state: IMiddlewareState) => {
    state.type = 'failed';
};

// eslint-disable-next-line @typescript-eslint/ban-types
export const middlewareSlice = createSlice<IMiddlewareState, {}, 'middleware'>({
    name: 'middleware',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(getMiddlewareAsync.pending, pendingCase)
            .addCase(getMiddlewareAsync.fulfilled, fulfilledCase)
            .addCase(getMiddlewareAsync.rejected, rejectedCase)
            .addCase(updateMiddlewareAsync.pending, pendingCase)
            .addCase(updateMiddlewareAsync.fulfilled, fulfilledCase)
            .addCase(updateMiddlewareAsync.rejected, rejectedCase);
    },
});

export default middlewareSlice.reducer;
