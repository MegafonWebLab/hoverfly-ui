import createRequest from '../axiosRequest';
import type { DeleteCache, IHoverflyApi, IRequestResponse, MainInfo } from '../types';

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
    };
};

export default hoverflyApi;
