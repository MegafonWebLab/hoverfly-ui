/* eslint-disable @typescript-eslint/no-explicit-any */
import type { RootState } from '../store';

export type ApiType = { hoverfly: IHoverflyApi };

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
    status: number;
    statusText: string;
    headers: {
        [key: string]: string;
    };
};

export interface IRequest {
    instance: any;
    get: <T>(url: string, options?: IRequestConfig) => Promise<IRequestResponse<T>>;
    post: <T>(url: string, params: any, options?: IRequestConfig) => Promise<IRequestResponse<T>>;
    put: <T>(url: string, params: any, options?: IRequestConfig) => Promise<IRequestResponse<T>>;
    patch: <T>(url: string, params: any, options?: IRequestConfig) => Promise<IRequestResponse<T>>;
    delete: <T>(url: string, options?: IRequestConfig) => Promise<IRequestResponse<T>>;
}

export type ThunkApiConfig = {
    rejectValue: Error;
    extra: ApiType;
    state: RootState;
};

export type MainInfo = {
    cors: {
        enabled: boolean;
        allowOrigin?: string;
        allowMethods?: string;
        allowHeaders?: string;
        preflightMaxAge?: number;
        allowCredentials?: boolean;
    };
    destination: string;
    middleware?: {
        binary: string;
        script: string;
        remote: string;
    };
    mode: ModeState['mode'];
    arguments: ModeState['arguments'];
    isWebServer: boolean;
    usage: {
        counters: {
            capture: number;
            diff: number;
            modify: number;
            simulate: number;
            spy: number;
            synthesize: number;
        };
    };
    version: string;
    upstreamProxy: string;
};

export type ModeState = {
    mode: 'simulate' | 'synthesize' | 'modify' | 'capture' | 'spy' | 'diff';
    arguments: {
        matchingStrategy: string;
        headersWhitelist?: string[];
        stateful?: boolean;
        overwriteDuplicate?: boolean;
    };
};

export type DeleteCache = { cache: string | null };
export type ServerState = { state: Record<string, string> };
export type Middleware = {
    binary: string;
    script: string;
    remote: string;
};

export interface IHoverflyApi {
    fetchMainInfo(): Promise<IRequestResponse<MainInfo>>;
    fetchDeleteCache(): Promise<IRequestResponse<DeleteCache>>;
    fetchShutdown(): Promise<IRequestResponse<void>>;
    fetchHealtCheck(): Promise<IRequestResponse<{ message: string }>>;

    fetchServerState(): Promise<IRequestResponse<ServerState>>;
    deleteServerState(): Promise<IRequestResponse<void>>;
    addServerState(data: ServerState): Promise<IRequestResponse<ServerState>>;
    updateServerState(data: ServerState): Promise<IRequestResponse<ServerState>>;

    fetchMode(): Promise<IRequestResponse<ModeState>>;
    updateMode(data: ModeState): Promise<IRequestResponse<ModeState>>;

    fetchMiddleware(): Promise<IRequestResponse<Middleware>>;
    updateMiddleware(data: Middleware): Promise<IRequestResponse<Middleware>>;
}
