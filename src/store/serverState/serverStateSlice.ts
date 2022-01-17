import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ServerState, ThunkApiConfig } from 'api/types';
import { showNotification } from '../../utils';
import type { IRequestState } from '../types';
import { RejectedActionType } from '../utils';

export type IServerState = {
    value: { state: Record<string, string> };
    request: IRequestState;
};

const initialState: IServerState = {
    value: { state: {} },
    request: {
        type: 'idle',
    },
};

const SUCCESS_REQUEST_STATUS = 200;

export const getServerStateAsync = createAsyncThunk<ServerState, void, ThunkApiConfig>(
    'serverState/fetchServerState',
    async (_: unknown, thunkAPI) => {
        const { data } = await thunkAPI.extra.hoverfly.fetchServerState();

        if (data) {
            return data;
        }

        return thunkAPI.rejectWithValue(new Error('Request error'));
    },
);

export const addServerStateAsync = createAsyncThunk<ServerState, ServerState, ThunkApiConfig>(
    'serverState/addServerState',
    async (state: ServerState, thunkAPI) => {
        const { data } = await thunkAPI.extra.hoverfly.addServerState(state);

        if (data) {
            return data;
        }

        return thunkAPI.rejectWithValue(new Error('Request error'));
    },
);

export const updateServerStateAsync = createAsyncThunk<ServerState, ServerState, ThunkApiConfig>(
    'serverState/updateServerState',
    async (state: ServerState, thunkAPI) => {
        const { data } = await thunkAPI.extra.hoverfly.updateServerState(state);

        if (data) {
            return data;
        }

        return thunkAPI.rejectWithValue(new Error('Request error'));
    },
);

export const clearServerStateAsync = createAsyncThunk<ServerState, void, ThunkApiConfig>(
    'serverState/clearServerState',
    async (_: unknown, thunkAPI) => {
        const { status } = await thunkAPI.extra.hoverfly.deleteServerState();

        if (status === SUCCESS_REQUEST_STATUS) {
            return { state: {} };
        }

        return thunkAPI.rejectWithValue(new Error('Request error'));
    },
);

const pendingCase = (state: IServerState): void => {
    state.request.type = 'pending';
};

const fulfilledCase = (
    state: IServerState,
    action: PayloadAction<
        ServerState,
        string,
        { arg: ServerState | void; requestId: string; requestStatus: 'fulfilled' }
    >,
): void => {
    state.request.type = 'success';
    state.value = action.payload;
};

const rejectedCase = (name: string) => (state: IServerState, action: RejectedActionType<ServerState>) => {
    showNotification(`${name} ${action.error.name?.toLowerCase()}`.trim(), action.error.message);
    state.request.type = 'failed';
};

export const cacheSlice = createSlice<IServerState, Record<string, never>, 'serverState'>({
    name: 'serverState',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(getServerStateAsync.pending, pendingCase)
            .addCase(getServerStateAsync.fulfilled, fulfilledCase)
            .addCase(getServerStateAsync.rejected, rejectedCase('Server state'))
            .addCase(addServerStateAsync.pending, pendingCase)
            .addCase(addServerStateAsync.fulfilled, fulfilledCase)
            .addCase(addServerStateAsync.rejected, rejectedCase('Server state add'))
            .addCase(clearServerStateAsync.pending, pendingCase)
            .addCase(clearServerStateAsync.fulfilled, fulfilledCase)
            .addCase(clearServerStateAsync.rejected, rejectedCase('Server state clear'));
    },
});

export default cacheSlice.reducer;
