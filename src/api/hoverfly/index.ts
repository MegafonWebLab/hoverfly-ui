import createRequest from '../axiosRequest';
import { IRequestResponse } from '../types';
import type { IHoverflyApi, MainInfo } from './types';

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
    };
};

export default hoverflyApi;
