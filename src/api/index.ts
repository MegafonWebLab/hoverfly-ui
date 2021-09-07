import hoverfly from 'api/hoverfly';
import { ApiType } from './types';

const baseURL = 'http://localhost:8888';

const api: ApiType = {
    hoverfly: hoverfly({ baseURL }),
};

export default api;
