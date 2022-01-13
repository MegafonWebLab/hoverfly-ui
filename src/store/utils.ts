import type { Action, PayloadAction, SerializedError } from '@reduxjs/toolkit';
import type { AxiosError } from 'axios';
import { needAuth } from './auth/authSlice';
import type { IRequestState } from './types';

const NOT_AUTH_STATUS = 401;

type RejectedActionType<T> = PayloadAction<
    Error | undefined,
    string,
    { arg: T | void; requestId: string; requestStatus: 'rejected'; aborted: boolean; condition: boolean } & (
        | { rejectedWithValue: true }
        | ({ rejectedWithValue: false } & Record<string, unknown>)
    ),
    SerializedError
>;

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
    <T extends IRequestState<unknown>, Data>() =>
    (state: T, action: RejectedActionType<Data>): void => {
        document.dispatchEvent(
            new CustomEvent('alert', {
                detail: {
                    title: action.error.name,
                    message: action.error.message,
                },
            }),
        );

        state.type = 'failed';
    };

export const getAuthParams = (e: AxiosError, dispatch: (a: Action) => void): Promise<AxiosError> => {
    if (e.response?.status === NOT_AUTH_STATUS) {
        dispatch(needAuth());
    }

    return Promise.reject(e);
};
