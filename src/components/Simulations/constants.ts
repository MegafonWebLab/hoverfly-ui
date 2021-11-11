import type { ISelectItem } from '@megafon/ui-core/dist/lib/components/Select/Select';
import type { SimulationResponse } from 'api/types';
import {
    BodyType,
    ServerState,
    SimulationHeadersQueryState,
    SimulationHeaderState,
    SimulationHtmlState,
    SimulationsServerState,
} from './types';

export const METHODS: Array<ISelectItem<string>> = [
    {
        value: 'GET',
        title: 'GET',
    },
    {
        value: 'POST',
        title: 'POST',
    },
];

export const MATCHES: Array<ISelectItem<string>> = [
    {
        value: 'exact',
        title: 'Exact match',
    },
    {
        value: 'Glob',
        title: 'Glob match',
    },
];

export const STATUS_CODES: Array<ISelectItem<number>> = [
    {
        value: 200,
        title: '200',
    },
    {
        value: 404,
        title: '404',
    },
];

export const initialState: SimulationResponse = {
    data: {
        pairs: [],
        globalActions: {
            delays: [],
            delaysLogNormal: [],
        },
    },
    meta: {
        schemaVersion: '',
        hoverflyVersion: '',
        timeExported: '',
    },
};

export const initialServerState: SimulationsServerState = {
    requiresState: [],
    transitionsState: [],
    removesState: [],
};

export const initialHeaderQuery: SimulationHeadersQueryState = {
    request: [],
    response: [],
    query: [],
};

export const serverStateEmpty: ServerState = { key: '', value: '' };
export const headerEmpty: SimulationHeaderState = { key: '', value: '', match: 'exact' };
export const initialBodyState: SimulationHtmlState = {
    request: [],
    response: { value: '', type: '' },
};

export const BODY_FORMATS: Array<ISelectItem<BodyType>> = [
    {
        value: 'json',
        title: 'JSON',
    },
    {
        value: 'xml',
        title: 'XML',
    },
    {
        value: 'html',
        title: 'HTML',
    },
    {
        value: 'text',
        title: 'Plain Text',
    },
];
