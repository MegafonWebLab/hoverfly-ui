import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { CreateSimulationResponse, SimulationRequest, SimulationResponse, ThunkApiConfig } from 'api/types';
import { omitKey, showNotification } from 'utils';
import type { IRequestState, IRequestStateSuccess } from '../types';
import { defaultFulfilledCase, defaultPendingCase, defaultRejectedCase } from '../utils';

const removeBodyFileKey = (data: SimulationResponse): SimulationResponse => ({
    ...data,
    data: {
        ...data.data,
        pairs: data.data.pairs.map(pair => ({
            ...pair,
            response: {
                ...omitKey(pair.response, 'bodyFile'),
            },
        })),
    },
});

export type ISimulationState = IRequestState<SimulationResponse>;

const initialState: ISimulationState = {
    type: 'idle',
};

export const getSimulationAsync = createAsyncThunk<SimulationResponse, SimulationRequest | undefined, ThunkApiConfig>(
    'simulation/get',
    async (formData: SimulationRequest | undefined, thunkAPI) => {
        const { data } = await thunkAPI.extra.hoverfly.fetchSimulation(formData);

        if (data) {
            return removeBodyFileKey(data);
        }

        return thunkAPI.rejectWithValue(new Error('Request error'));
    },
);

export const createSimulationAsync = createAsyncThunk<
    CreateSimulationResponse,
    CreateSimulationResponse,
    ThunkApiConfig
>('simulation/create', async (content: CreateSimulationResponse, thunkAPI) => {
    const { data } = await thunkAPI.extra.hoverfly.createSimulation(content.data);
    if (data) {
        return { data: removeBodyFileKey(data), type: content.type };
    }

    return thunkAPI.rejectWithValue(new Error('Request error'));
});

export const updateSimulationAsync = createAsyncThunk<SimulationResponse, SimulationResponse, ThunkApiConfig>(
    'simulation/update',
    async (content: SimulationResponse, thunkAPI) => {
        const { data } = await thunkAPI.extra.hoverfly.updateSimulation(content);

        if (data) {
            return removeBodyFileKey(data);
        }

        return thunkAPI.rejectWithValue(new Error('Request error'));
    },
);

// eslint-disable-next-line @typescript-eslint/ban-types
export const simulationSlice = createSlice<ISimulationState, {}, 'simulation'>({
    name: 'simulation',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(getSimulationAsync.pending, defaultPendingCase<ISimulationState>())
            .addCase(
                getSimulationAsync.fulfilled,
                defaultFulfilledCase<ISimulationState, SimulationResponse | SimulationRequest>(),
            )
            .addCase(
                getSimulationAsync.rejected,
                defaultRejectedCase<ISimulationState, SimulationRequest>('Simulation'),
            )
            .addCase(createSimulationAsync.pending, defaultPendingCase<ISimulationState>())
            .addCase(createSimulationAsync.fulfilled, (state: IRequestStateSuccess<SimulationResponse>, action) => {
                const name = action.payload.type === 'simulation' ? 'Simulation updated' : 'Settings updated';
                showNotification(name, '', false);
                state.type = 'success';
                state.value = action.payload.data;
            })
            .addCase(
                createSimulationAsync.rejected,
                defaultRejectedCase<ISimulationState, CreateSimulationResponse>('Simulation/settings update'),
            )
            .addCase(updateSimulationAsync.pending, defaultPendingCase<ISimulationState>())
            .addCase(updateSimulationAsync.fulfilled, defaultFulfilledCase<ISimulationState, SimulationResponse>())
            .addCase(
                updateSimulationAsync.rejected,
                defaultRejectedCase<ISimulationState, SimulationResponse>('Simulation update'),
            );
    },
});

export default simulationSlice.reducer;
