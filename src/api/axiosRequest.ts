/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosInstance } from 'axios';
import type { IRequest, IRequestCreateOptions, IRequestConfig } from './types';

class AxiosRequest implements IRequest {
    instance: AxiosInstance;

    constructor(options: IRequestCreateOptions) {
        this.instance = axios.create(options);
    }

    get<T>(url: string, options?: IRequestConfig): Promise<T> {
        return this.instance.get(url, options);
    }

    post<T>(url: string, data: any, options?: IRequestConfig): Promise<T> {
        return this.instance.post(url, data, options);
    }
}

const createRequest = (options: IRequestCreateOptions): AxiosRequest => new AxiosRequest(options);

export default createRequest;
