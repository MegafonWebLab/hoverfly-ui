import type { ISelectItem } from '@megafon/ui-core/dist/lib/components/Select/Select';
import type { SimulationResponse, SimulationItem } from 'api/types';
import type { MirrorBodyType } from 'utils';
import {
    ServerState,
    SimulationFieldsErrorState,
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
    {
        value: 'PUT',
        title: 'PUT',
    },
    {
        value: 'DELETE',
        title: 'DELETE',
    },
];

export const MATCHES: Array<ISelectItem<string>> = [
    {
        value: 'exact',
        title: 'Exact match',
    },
    {
        value: 'glob',
        title: 'Glob match',
    },
    {
        value: 'regex',
        title: 'Regex match',
    },
    {
        value: 'xml',
        title: 'Xml match',
    },
    {
        value: 'xpath',
        title: 'Xpath match',
    },
    {
        value: 'json',
        title: 'Json match',
    },
    {
        value: 'jsonPartial',
        title: 'JsonPartial match',
    },
    {
        value: 'jsonpath',
        title: 'Jsonpath match',
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

export const FIELDS_ERROR: SimulationFieldsErrorState = {
    statusCode: 'Response status code is not valid. Status code should between 100 and 599',
};

export const STATUS_CODE_VALID_VALUE = {
    minValue: 100,
    maxValue: 600,
} as const;

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

export const initialPairState: SimulationItem = {
    request: {
        method: [
            {
                value: 'GET',
                matcher: 'exact',
            },
        ],
    },
    response: {
        status: 200,
        body: '',
    },
};

export const initialHeaderQuery: SimulationHeadersQueryState = {
    request: [],
    response: [],
    query: [],
};

export const serverStateEmpty: ServerState = { key: '', value: '' };
export const headerEmpty: SimulationHeaderState = { key: '', value: '', match: 'exact' };
export const initialBodyState: SimulationHtmlState = {
    request: { value: '', type: 'json', matcher: 'exact' },
    response: { value: '', type: 'json' },
};

export const initialFieldsError: SimulationFieldsErrorState = { statusCode: '' };

export const BODY_FORMATS: Array<ISelectItem<MirrorBodyType>> = [
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
