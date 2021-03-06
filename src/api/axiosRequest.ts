/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosInstance } from 'axios';
import type { IRequest, IRequestCreateOptions, IRequestConfig, AxiosErrorCallback } from './types';

class AxiosRequest implements IRequest {
    instance: AxiosInstance;

    constructor(options: IRequestCreateOptions) {
        this.instance = axios.create(options);
    }

    interceptors(cbe: AxiosErrorCallback): void {
        this.instance.interceptors.response.use(c => c, cbe);
    }

    get<T>(url: string, options?: IRequestConfig): Promise<T> {
        return this.instance.get(url, options);
    }

    post<T>(url: string, data: any, options?: IRequestConfig): Promise<T> {
        return this.instance.post(url, data, options);
    }

    put<T>(url: string, data: any, options?: IRequestConfig): Promise<T> {
        return this.instance.put(url, data, options);
    }

    patch<T>(url: string, data: any, options?: IRequestConfig): Promise<T> {
        return this.instance.patch(url, data, options);
    }

    delete<T>(url: string, options?: IRequestConfig): Promise<T> {
        return this.instance.delete(url, options);
    }
}

const createRequest = (options: IRequestCreateOptions): AxiosRequest => new AxiosRequest(options);

export default createRequest;
