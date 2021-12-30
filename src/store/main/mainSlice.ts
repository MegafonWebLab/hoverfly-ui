import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { MainInfo, ThunkApiConfig } from 'api/types';
import type { IRequestState, IRequestStateFailed, IRequestStateSuccess } from '../types';

export type IMainState = IRequestState<MainInfo>;

const initialState: IMainState = {
    type: 'success',
    value: {
        cors: {
            enabled: true,
            allowOrigin: '*',
            allowMethods: 'GET, POST, PULL, PATCH',
            allowHeaders: 'Content-type, Origin',
            preflightMaxAge: 1800,
            allowCredentials: true,
        },
        destination: 'destination',
        mode: 'Simulate',
        arguments: {
            matchingStrategy: 'matchingStrategy',
        },
        isWebServer: true,
        usage: {
            counters: {
                capture: 10,
                diff: 20,
                modify: 30,
                simulate: 40,
                spy: 50,
                synthesize: 60,
            },
        },
        version: '1.2.3',
        upstreamProxy: 'upstreamProxy',
    },
};

export const loadMainAsync = createAsyncThunk<MainInfo, void, ThunkApiConfig>(
    'main/fetchMain',
    async (_: unknown, thunkAPI) => {
        const { data } = await thunkAPI.extra.hoverfly.fetchMainInfo();

        if (data) {
            return data;
        }

        return thunkAPI.rejectWithValue(new Error('Request error'));
    },
);

// eslint-disable-next-line @typescript-eslint/ban-types
export const mainSlice = createSlice<IMainState, {}, 'main'>({
    name: 'main',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(loadMainAsync.pending, state => {
                state.type = 'pending';
            })
            .addCase(loadMainAsync.fulfilled, (state: IRequestStateSuccess<MainInfo>, action) => {
                state.type = 'success';
                state.value = action.payload;
            })
            .addCase(loadMainAsync.rejected, (state: IRequestStateFailed, action) => {
                state.type = 'failed';
                state.error = action.error.message || '';
            });
    },
});

export default mainSlice.reducer;
