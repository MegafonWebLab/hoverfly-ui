import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { ThunkApiConfig, Pac } from 'api/types';
import type { IRequestState } from '../types';
import { defaultFulfilledCase, defaultPendingCase, defaultRejectedCase } from '../utils';

export type IPacState = IRequestState<Pac>;

const initialState: IPacState = {
    type: 'idle',
};

export const getPacAsync = createAsyncThunk<Pac, void, ThunkApiConfig>('pac/get', async (_: unknown, thunkAPI) => {
    const { data } = await thunkAPI.extra.hoverfly.fetchPac();

    if (data) {
        return data;
    }

    return thunkAPI.rejectWithValue(new Error('Request error'));
});

export const updatePacAsync = createAsyncThunk<string, string, ThunkApiConfig>(
    'pac/update',
    async (content: string, thunkAPI) => {
        const { data } = await thunkAPI.extra.hoverfly.updatePac(content);

        if (data) {
            return data;
        }

        return thunkAPI.rejectWithValue(new Error('Request error'));
    },
);

export const deletePacAsync = createAsyncThunk<void, void, ThunkApiConfig>(
    'pac/delete',
    async (_: unknown, thunkAPI) => {
        const { data } = await thunkAPI.extra.hoverfly.deletePac();

        return data;
    },
);

// eslint-disable-next-line @typescript-eslint/ban-types
export const middlewareSlice = createSlice<IPacState, {}, 'pac'>({
    name: 'pac',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(getPacAsync.pending, defaultPendingCase<IPacState>())
            .addCase(getPacAsync.fulfilled, defaultFulfilledCase<IPacState, Pac>())
            .addCase(getPacAsync.rejected, defaultRejectedCase<IPacState, Pac>())
            .addCase(updatePacAsync.pending, defaultPendingCase<IPacState>())
            .addCase(updatePacAsync.fulfilled, defaultFulfilledCase<IPacState, string>())
            .addCase(updatePacAsync.rejected, defaultRejectedCase<IPacState, Pac>('Pac update'))
            .addCase(deletePacAsync.pending, defaultPendingCase<IPacState>())
            .addCase(deletePacAsync.fulfilled, defaultFulfilledCase<IPacState, void>())
            .addCase(deletePacAsync.rejected, defaultRejectedCase<IPacState, Pac>('Pac remove'));
    },
});

export default middlewareSlice.reducer;
