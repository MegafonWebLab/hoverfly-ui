import hoverfly from 'api/hoverfly';
import type { ApiType, AxiosErrorCallback } from './types';

const api = (cbe: AxiosErrorCallback): ApiType => ({
    hoverfly: hoverfly({ baseURL: '' }, cbe),
});

export default api;
