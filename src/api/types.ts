/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AxiosError } from 'axios';
import type { RootState } from '../store';

export type AxiosErrorCallback = (e: AxiosError) => void;

export type ApiType = {
    hoverfly: IHoverflyApi;
};

export interface IAuthConfig {
    bearer?: string;
}

export interface IRequestCreateOptions {
    baseURL: string;
}
export interface IRequestConfig {
    headers?: {
        [key: string]: string;
    };
    params?: {
        [key: string]: string | number;
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
export type Destination = { destination: string };
export type UpstreamProxy = { upstreamProxy: string };
export type Pac = { error: string } | string;
export type LogsRequest = {
    limit?: number;
    from?: number;
};

export type LogsItem = {
    Destination: string;
    Mode?: string;
    WebserverPort: string;

    destination?: string;
    mode?: string;
    port?: string;
    ProxyPort?: string;
    AdminPort?: string;

    json?: string;

    stdin?: string;
    command?: string;

    failed?: number;
    successful?: string;
    total?: number;

    middleware?: string;
    payload?: string;

    level: string;
    msg: string;
    time: string;
};
export type LogsResponse = {
    logs: LogsItem[];
};

export type JournalItem = {
    request: {
        path: string;
        method: string;
        destination: string;
        scheme: string;
        query: string;
        body: string;
        headers: Record<string, string[]>;
    };
    response: {
        status: number;
        body: string;
        encodedBody: boolean;
        headers: Record<string, string[]>;
    };
    mode: string;
    timeStarted: string;
    latency: number;
};
export type JournalRequest = {
    limit?: number;
    offset?: number;
    to?: number;
    from?: number;
    sort?: string;
};
export type JournalResponse = {
    journal: JournalItem[];
    offset: number;
    limit: number;
    total: number;
};

export type JournalSearchDataRequest = {
    status?: string;
    mode?: string;
};

export type JournalSearchRequest = {
    response: {
        status?: [
            {
                matcher: 'exact';
                value: string;
            },
        ];
        mode?: [
            {
                matcher: 'exact';
                value: string;
            },
        ];
    };
};

export type HoverflyMatcherValues = 'exact' | 'glob';

export type HoverflyMatcher = {
    matcher: HoverflyMatcherValues;
    value: string;
};

export type PairItemRequest = {
    path?: HoverflyMatcher[];
    method?: HoverflyMatcher[];
    destination?: HoverflyMatcher[];
    scheme?: HoverflyMatcher[];
    body?: HoverflyMatcher[];
    headers?: Record<string, HoverflyMatcher[]>;
    query?: Record<string, HoverflyMatcher[]>;
    requiresState?: Record<string, string>;
};

export type PairItemResponse = {
    status: number;
    fixedDelay?: number;
    body: string;
    encodedBody?: boolean;
    headers?: Record<string, string[]>;
    templated?: boolean;
    removesState?: string[];
    transitionsState?: Record<string, string>;
};

export type SimulationRequest = {
    urlPattern?: string;
};

export type SimulationItem = {
    request: PairItemRequest;
    response: PairItemResponse;
};

export type SimulationGlobalDelay = {
    urlPattern?: string;
    httpMethod?: string;
    delay: number;
};

export type SimulationResponse = {
    data: {
        pairs: SimulationItem[];
        globalActions: {
            delays: SimulationGlobalDelay[];
            delaysLogNormal: string[];
        };
    };
    meta: {
        schemaVersion: string;
        hoverflyVersion: string;
        timeExported: string;
    };
};

export type AuthRequest = { username: string; password: string };
export type AuthResponse = { token: string };

export interface IHoverflyApi {
    getAuth(data: AuthRequest): Promise<IRequestResponse<AuthResponse>>;

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

    fetchDestination(): Promise<IRequestResponse<Destination>>;
    updateDestination(data: Destination): Promise<IRequestResponse<Destination>>;
    fetchUpstreamProxy(): Promise<IRequestResponse<UpstreamProxy>>;

    fetchPac(): Promise<IRequestResponse<Pac>>;
    updatePac(code: string): Promise<IRequestResponse<string>>;
    deletePac(): Promise<IRequestResponse<void>>;

    fetchLogs(data?: LogsRequest): Promise<IRequestResponse<LogsResponse>>;

    fetchJournal(data?: JournalRequest): Promise<IRequestResponse<JournalResponse>>;
    deleteJournal(): Promise<IRequestResponse<void>>;
    searchJournal(data: JournalSearchDataRequest): Promise<IRequestResponse<JournalResponse>>;

    fetchSimulation(data?: SimulationRequest): Promise<IRequestResponse<SimulationResponse>>;
    createSimulation(data: SimulationResponse): Promise<IRequestResponse<SimulationResponse>>;
    updateSimulation(data: SimulationResponse): Promise<IRequestResponse<SimulationResponse>>;
}
