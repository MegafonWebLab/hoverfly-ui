import type { Action, PayloadAction } from '@reduxjs/toolkit';
import type { AxiosError } from 'axios';
import { needAuth } from './auth/authSlice';
import type { IRequestState } from './types';

const NOT_AUTH_STATUS = 401;

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

export const getAuthParams = (e: AxiosError, dispatch: (a: Action) => void): Promise<AxiosError> => {
    if (e.response?.status === NOT_AUTH_STATUS) {
        dispatch(needAuth());
    }

    return Promise.reject(e);
};
