import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { ThunkApiConfig, Destination } from 'api/types';
import type { IRequestState } from '../types';
import { defaultFulfilledCase, defaultPendingCase, defaultRejectedCase } from '../utils';

export type IDestinationState = IRequestState<Destination>;

const initialState: IDestinationState = {
    type: 'idle',
};

export const getDestinationAsync = createAsyncThunk<Destination, void, ThunkApiConfig>(
    'destination/get',
    async (_: unknown, thunkAPI) => {
        const { data } = await thunkAPI.extra.hoverfly.fetchDestination();

        if (data) {
            return data;
        }

        return thunkAPI.rejectWithValue(new Error('Request error'));
    },
);

export const updateDestinationAsync = createAsyncThunk<Destination, Destination, ThunkApiConfig>(
    'destination/update',
    async (content: Destination, thunkAPI) => {
        const { data } = await thunkAPI.extra.hoverfly.updateDestination(content);

        if (data) {
            return data;
        }

        return thunkAPI.rejectWithValue(new Error('Request error'));
    },
);

// eslint-disable-next-line @typescript-eslint/ban-types
export const middlewareSlice = createSlice<IDestinationState, {}, 'destination'>({
    name: 'destination',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(getDestinationAsync.pending, defaultPendingCase<IDestinationState>())
            .addCase(getDestinationAsync.fulfilled, defaultFulfilledCase<IDestinationState, Destination>())
            .addCase(getDestinationAsync.rejected, defaultRejectedCase<IDestinationState>())
            .addCase(updateDestinationAsync.pending, defaultPendingCase<IDestinationState>())
            .addCase(updateDestinationAsync.fulfilled, defaultFulfilledCase<IDestinationState, Destination>())
            .addCase(updateDestinationAsync.rejected, defaultRejectedCase<IDestinationState>());
    },
});

export default middlewareSlice.reducer;
