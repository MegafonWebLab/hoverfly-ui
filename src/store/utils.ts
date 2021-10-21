import type { PayloadAction } from '@reduxjs/toolkit';
import type { IRequestState } from './types';

export const defaultPendingCase =
    <T extends IRequestState<unknown>>() =>
    (state: T): void => {
        state.type = 'pending';
    };

export const defaultFulfilledCase =
    <State extends IRequestState<unknown>, Data>() =>
    (
        state: State,
        action: PayloadAction<Data, string, { arg: Data | void; requestId: string; requestStatus: 'fulfilled' }>,
    ): void => {
        state.type = 'success';
        if (state.type === 'success') {
            state.value = action.payload;
        }
    };

export const defaultRejectedCase =
    <T extends IRequestState<unknown>>() =>
    (state: T): void => {
        state.type = 'failed';
    };
