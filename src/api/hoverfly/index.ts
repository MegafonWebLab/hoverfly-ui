import createRequest from '../axiosRequest';
import type { DeleteCache, IHoverflyApi, IRequestResponse, MainInfo } from '../types';

type ApiCreate = {
    baseURL: string;
};

const hoverflyApi = ({ baseURL }: ApiCreate): IHoverflyApi => {
    const instance = createRequest({
        baseURL: `${baseURL}/api/v2`,
    });

    return {
        fetchMainInfo(): Promise<IRequestResponse<MainInfo>> {
            return instance.get('/hoverfly');
        },
        fetchDeleteCache(): Promise<IRequestResponse<DeleteCache>> {
            return instance.delete('/cache');
        },
        fetchShutdown(): Promise<IRequestResponse<void>> {
            return instance.delete('/shutdown');
        },
    };
};

export default hoverflyApi;
