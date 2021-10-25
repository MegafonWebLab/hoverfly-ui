import type { AxiosError } from 'axios';
import { TOKEN_NAME } from 'constants/cookie';
import { getCookie } from 'utils';
import createRequest from '../axiosRequest';
import type {
    DeleteCache,
    Destination,
    IHoverflyApi,
    IRequestResponse,
    JournalRequest,
    JournalResponse,
    JournalSearchRequest,
    LogsRequest,
    LogsResponse,
    MainInfo,
    Middleware,
    ModeState,
    Pac,
    ServerState,
    UpstreamProxy,
    JournalSearchDataRequest,
    AuthResponse,
    AuthRequest,
} from '../types';

type ApiCreate = {
    baseURL: string;
};

const getAuthConfig = (): { headers: Record<string, string> } => {
    const authToken = getCookie(TOKEN_NAME);

    return { headers: authToken ? { Authorization: `Bearer ${authToken}` } : {} };
};

const hoverflyApi = ({ baseURL }: ApiCreate, cbe: (e: AxiosError) => void): IHoverflyApi => {
    const instance = createRequest({
        baseURL: `${baseURL}/api`,
    });

    instance.interceptors(cbe);

    return {
        getAuth(data: AuthRequest): Promise<IRequestResponse<AuthResponse>> {
            return instance.post('/token-auth', data);
        },
        fetchMainInfo(): Promise<IRequestResponse<MainInfo>> {
            return instance.get('/v2/hoverfly', getAuthConfig());
        },
        fetchDeleteCache(): Promise<IRequestResponse<DeleteCache>> {
            return instance.delete('/v2/cache', getAuthConfig());
        },
        fetchShutdown(): Promise<IRequestResponse<void>> {
            return instance.delete('/v2/shutdown', getAuthConfig());
        },
        fetchHealtCheck(): Promise<IRequestResponse<{ message: string }>> {
            return instance.get('/health');
        },
        fetchServerState(): Promise<IRequestResponse<ServerState>> {
            return instance.get('/v2/state', getAuthConfig());
        },
        addServerState(data: ServerState): Promise<IRequestResponse<ServerState>> {
            return instance.put('/v2/state', data, getAuthConfig());
        },
        updateServerState(data: ServerState): Promise<IRequestResponse<ServerState>> {
            return instance.patch('/v2/state', data, getAuthConfig());
        },
        deleteServerState(): Promise<IRequestResponse<void>> {
            return instance.delete('/v2/state', getAuthConfig());
        },
        fetchMode(): Promise<IRequestResponse<ModeState>> {
            return instance.get('/v2/hoverfly/mode', getAuthConfig());
        },
        updateMode(data: ModeState): Promise<IRequestResponse<ModeState>> {
            return instance.put('/v2/hoverfly/mode', data, getAuthConfig());
        },
        fetchMiddleware(): Promise<IRequestResponse<Middleware>> {
            return instance.get('/v2/hoverfly/middleware', getAuthConfig());
        },
        updateMiddleware(data: Middleware): Promise<IRequestResponse<Middleware>> {
            return instance.put('/v2/hoverfly/middleware', data, getAuthConfig());
        },
        fetchDestination(): Promise<IRequestResponse<Destination>> {
            return instance.get('/v2/hoverfly/destination', getAuthConfig());
        },
        updateDestination(data: Destination): Promise<IRequestResponse<Destination>> {
            return instance.put('/v2/hoverfly/destination', data, getAuthConfig());
        },
        fetchUpstreamProxy(): Promise<IRequestResponse<UpstreamProxy>> {
            return instance.get('/v2/hoverfly/upstream-proxy', getAuthConfig());
        },
        fetchPac(): Promise<IRequestResponse<Pac>> {
            return instance.get('/v2/hoverfly/pac', getAuthConfig());
        },
        updatePac(code: string): Promise<IRequestResponse<string>> {
            return instance.put('/v2/hoverfly/pac', code, getAuthConfig());
        },
        deletePac(): Promise<IRequestResponse<void>> {
            return instance.delete('/v2/hoverfly/pac', getAuthConfig());
        },
        fetchLogs(data?: LogsRequest): Promise<IRequestResponse<LogsResponse>> {
            return instance.get('/v2/logs', {
                params: data,
                headers: { ...getAuthConfig().headers, Accept: 'application/json' },
            });
        },
        fetchJournal(data?: JournalRequest): Promise<IRequestResponse<JournalResponse>> {
            return instance.get('/v2/journal', { params: data, ...getAuthConfig() });
        },
        deleteJournal(): Promise<IRequestResponse<void>> {
            return instance.delete('/v2/journal', getAuthConfig());
        },
        searchJournal(_data: JournalSearchDataRequest): Promise<IRequestResponse<JournalResponse>> {
            const formData: JournalSearchRequest = {
                response: {},
            };

            return instance.post('/v2/journal', formData, getAuthConfig());
        },
    };
};

export default hoverflyApi;
