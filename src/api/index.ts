import hoverfly from 'api/hoverfly';
import type { IHoverflyApi } from './hoverfly/types';

export type ApiType = { hoverfly: IHoverflyApi };

const baseURL = 'http://localhost:8888';

const api: ApiType = {
    hoverfly: hoverfly({ baseURL }),
};

export default api;
