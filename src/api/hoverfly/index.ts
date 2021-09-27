import createRequest from '../axiosRequest';
import type {
    DeleteCache,
    Destination,
    IHoverflyApi,
    IRequestResponse,
    LogsRequest,
    LogsResponse,
    MainInfo,
    Middleware,
    ModeState,
    Pac,
    ServerState,
    UpstreamProxy,
} from '../types';

type ApiCreate = {
    baseURL: string;
};

const hoverflyApi = ({ baseURL }: ApiCreate): IHoverflyApi => {
    const instance = createRequest({
        baseURL: `${baseURL}/api`,
    });

    return {
        fetchMainInfo(): Promise<IRequestResponse<MainInfo>> {
            return instance.get('/v2/hoverfly');
        },
        fetchDeleteCache(): Promise<IRequestResponse<DeleteCache>> {
            return instance.delete('/v2/cache');
        },
        fetchShutdown(): Promise<IRequestResponse<void>> {
            return instance.delete('/v2/shutdown');
        },
        fetchHealtCheck(): Promise<IRequestResponse<{ message: string }>> {
            return instance.get('/health');
        },
        fetchServerState(): Promise<IRequestResponse<ServerState>> {
            return instance.get('/v2/state');
        },
        addServerState(data: ServerState): Promise<IRequestResponse<ServerState>> {
            return instance.put('/v2/state', data);
        },
        updateServerState(data: ServerState): Promise<IRequestResponse<ServerState>> {
            return instance.patch('/v2/state', data);
        },
        deleteServerState(): Promise<IRequestResponse<void>> {
            return instance.delete('/v2/state');
        },
        fetchMode(): Promise<IRequestResponse<ModeState>> {
            return instance.get('/v2/hoverfly/mode');
        },
        updateMode(data: ModeState): Promise<IRequestResponse<ModeState>> {
            return instance.put('/v2/hoverfly/mode', data);
        },
        fetchMiddleware(): Promise<IRequestResponse<Middleware>> {
            return instance.get('/v2/hoverfly/middleware');
        },
        updateMiddleware(data: Middleware): Promise<IRequestResponse<Middleware>> {
            return instance.put('/v2/hoverfly/middleware', data);
        },
        fetchDestination(): Promise<IRequestResponse<Destination>> {
            return instance.get('/v2/hoverfly/destination');
        },
        updateDestination(data: Destination): Promise<IRequestResponse<Destination>> {
            return instance.put('/v2/hoverfly/destination', data);
        },
        fetchUpstreamProxy(): Promise<IRequestResponse<UpstreamProxy>> {
            return instance.get('/v2/hoverfly/upstream-proxy');
        },
        fetchPac(): Promise<IRequestResponse<Pac>> {
            return instance.get('/v2/hoverfly/pac');
        },
        updatePac(code: string): Promise<IRequestResponse<string>> {
            return instance.put('/v2/hoverfly/pac', code);
        },
        deletePac(): Promise<IRequestResponse<void>> {
            return instance.delete('/v2/hoverfly/pac');
        },
        fetchLogs(data?: LogsRequest): Promise<IRequestResponse<LogsResponse>> {
            return instance.get('/v2/logs', {
                params: data,
                headers: { Accept: 'application/json' },
            });
        },
    };
};

export default hoverflyApi;
