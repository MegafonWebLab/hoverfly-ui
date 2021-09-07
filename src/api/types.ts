/* eslint-disable @typescript-eslint/no-explicit-any */
import { RootState } from '../store';
import { ApiType } from '.';

export interface IRequestCreateOptions {
    baseURL: string;
}
export interface IRequestConfig {
    headers: {
        [key: string]: string;
    };
}

export type IRequestResponse<T> = {
    data: T;
};

export interface IRequest {
    instance: any;
    get: <T>(url: string, options: IRequestConfig) => Promise<IRequestResponse<T>>;
    post: <T>(url: string, params: any, options: IRequestConfig) => Promise<IRequestResponse<T>>;
}

export type ThunkApiConfig = {
    rejectValue: Error;
    extra: ApiType;
    state: RootState;
};
