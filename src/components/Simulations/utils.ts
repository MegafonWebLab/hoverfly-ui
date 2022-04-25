import cloneDeep from 'clone-deep';
import type {
    SimulationResponse,
    SimulationItem,
    HoverflyMatcher,
    PairItemRequest,
    PairItemResponse,
    HoverflyMatcherValues,
} from 'api/types';
import type { MirrorBodyType } from 'utils';
import type {
    ServerState,
    SimulationsServerState,
    SimulationHeaderState,
    SimulationHeadersQueryState,
    SimulationCodeMirrorOptions,
    SimulationHtmlState,
    RouteItem,
} from './types';

// eslint-disable-next-line import/prefer-default-export
export const getRouteList = (pairs: SimulationItem[]): RouteItem[] =>
    pairs.map<RouteItem>((pair, index) => {
        const pathValue = pair.request.path?.[0].value;
        const method = pair.request.method?.[0].value || 'GET';
        const isRequiresState = !!pair.request.requiresState;
        const isNewState = !!pair.response.transitionsState;

        return {
            name: `${pathValue}`,
            index,
            method: method.toLowerCase(),
            isRequiresState,
            isNewState,
        };
    });

export const getRequireStateList = (pair: SimulationItem): ServerState[] =>
    Object.entries(pair.request.requiresState || {}).map(([key, value]) => ({ key, value }));

export const getTransitionStateList = (pair: SimulationItem): ServerState[] =>
    Object.entries(pair.response.transitionsState || {}).map(([key, value]) => ({ key, value }));

export const getRemoveStateList = (pair: SimulationItem): ServerState[] =>
    (pair.response.removesState || []).map(value => ({ value }));

export const getRequestHeadersStateList = (pair: SimulationItem): SimulationHeaderState[] =>
    Object.entries(pair.request.headers || {}).map(([key, value]) => ({
        key,
        value: value[0].value,
        match: value[0].matcher,
    }));

export const getRequestQueryStateList = (pair: SimulationItem): SimulationHeaderState[] =>
    Object.entries(pair.request.query || {}).map(([key, value]) => ({
        key,
        value: value?.[0].value,
        match: value?.[0].matcher,
    }));

export const getResponseHeaderStateList = (pair: SimulationItem): SimulationHeaderState[] =>
    Object.entries(pair.response.headers || {}).map(([key, value]) => ({
        key,
        value: value?.[0],
        match: '',
    }));

export const getDelay = (data: SimulationResponse): string | undefined => {
    const [first] = data?.data.globalActions.delays;

    return first ? first.delay.toString() : '0';
};

const serverStateToObjectReduce = (acc: Record<string, string>, item: ServerState) => {
    if (item.key) {
        acc[item.key] = item.value;
    }

    return acc;
};

const headerResponseToObjectReduce = (acc: Record<string, string[]>, item: ServerState) => {
    if (item.key) {
        acc[item.key] = [item.value];
    }

    return acc;
};

const headerStateToObjectReduce = (acc: Record<string, HoverflyMatcher[]>, item: SimulationHeaderState) => {
    if (item.key) {
        acc[item.key] = [
            {
                matcher: item.match as HoverflyMatcherValues,
                value: item.value,
            },
        ];
    }

    return acc;
};

export const mergeCurrentStateToMainState = (
    state: SimulationResponse,
    currentState: SimulationItem,
    index: number,
): SimulationResponse => {
    const newState = cloneDeep(state);
    newState.data.pairs[index] = currentState;

    return newState;
};

export const mergeServerStateToCurrentPair = (
    state: SimulationItem,
    serverState: SimulationsServerState,
): SimulationItem => {
    const newState = cloneDeep(state);

    newState.request.requiresState = serverState.requiresState.reduce(serverStateToObjectReduce, {});
    newState.response.transitionsState = serverState.transitionsState.reduce(serverStateToObjectReduce, {});
    newState.response.removesState = serverState.removesState.map(a => a.value);

    return newState;
};

export const mergeHeaderStateToCurrentPair = (
    state: SimulationItem,
    headerState: SimulationHeadersQueryState,
): SimulationItem => {
    const newState = cloneDeep(state);

    newState.request.headers = headerState.request.reduce(headerStateToObjectReduce, {});
    newState.response.headers = headerState.response.reduce(headerResponseToObjectReduce, {});
    newState.request.query = headerState.query.reduce(headerStateToObjectReduce, {});

    return newState;
};

export const mergeBodyStateToCurrentPair = (state: SimulationItem, bodyState: SimulationHtmlState): SimulationItem => {
    const newState = cloneDeep(state);

    newState.request.body = bodyState.request.value
        ? [{ value: bodyState.request.value, matcher: bodyState.request.matcher || 'exact' }]
        : undefined;
    newState.response.body = bodyState.response.value as string;

    return newState;
};

export const mergeDelayToMainState = (state: SimulationResponse, delay: number): SimulationResponse => {
    const newState = cloneDeep(state);

    newState.data.globalActions.delays[0] = {
        urlPattern: '.',
        delay,
    };

    return newState;
};

export const changeServerState = (
    state: SimulationsServerState,
    key: keyof SimulationsServerState,
    name: keyof ServerState,
    index: number,
    value: string,
): SimulationsServerState => {
    const newState = cloneDeep(state);
    newState[key][index][name] = value;

    return { ...newState };
};

export const changeHeaderState = (
    state: SimulationHeadersQueryState,
    key: keyof SimulationHeadersQueryState,
    name: keyof SimulationHeaderState,
    index: number,
    value: string,
): SimulationHeadersQueryState => {
    const newState = cloneDeep(state);
    newState[key][index][name] = value;

    return { ...newState };
};

export const changeCurrentPairRequest = (
    state: SimulationItem | undefined,
    name: keyof Omit<PairItemRequest, 'headers' | 'query' | 'requiresState'>,
    key: keyof HoverflyMatcher,
    value: string,
): SimulationItem | undefined =>
    !state
        ? state
        : {
              ...state,
              request: {
                  ...state.request,
                  [name]: [
                      {
                          ...state.request[name]?.[0],
                          [key]: value,
                      },
                  ],
              },
          };

export const changeCurrentPairResponse = (
    state: SimulationItem | undefined,
    name: keyof PairItemResponse,
    value: string | number | boolean,
): SimulationItem | undefined =>
    !state
        ? state
        : {
              ...state,
              response: {
                  ...state.response,
                  [name]: value,
              },
          };

export const getCodeMirrorConfig = (type: MirrorBodyType): SimulationCodeMirrorOptions => {
    const options: SimulationCodeMirrorOptions = {
        theme: 'default',
        lineNumbers: true,
    };
    switch (type) {
        case 'text':
            options.mode = 'text';
            break;
        case 'xml':
            options.mode = 'xml';
            break;
        case 'html':
            options.mode = 'htmlmixed';
            break;
        case 'json':
            options.mode = {
                name: 'javascript',
                json: true,
            };
            break;
        default:
            break;
    }

    return options;
};

export const addOrRemoveEl = <T>(list: T[], data: { add: T; remove?: number }): T[] => {
    const newList = [...list];
    if (data.remove !== undefined) {
        newList.splice(data.remove, 1);
    } else {
        newList.push(data.add);
    }

    return newList;
};

export type ValidateImport = {
    type: 'success' | 'error';
    message: string;
};

const MATCHERS = ['exact', 'glob', 'regex', 'xml', 'xpath', 'json', 'jsonPartial', 'jsonpath'];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function inValidMatcher(data: any): boolean {
    if (Array.isArray(data)) {
        return data.reduce((acc, item) => {
            if (typeof item.mather != null && item.value != null) {
                acc = !MATCHERS.includes(item.matcher);
            }

            return acc;
        }, true);
    }

    return true;
}

export function validateImport(data: unknown): ValidateImport {
    const result: ValidateImport = { type: 'success', message: '' };
    const messages: string[] = [];
    if (!Array.isArray(data)) {
        return { type: 'error', message: 'Root element should be array of simulations' };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data.forEach((elem: any, index: number) => {
        if (typeof elem !== 'object' && Array.isArray(elem)) {
            messages.push('Element of array should be object with request and response keys');

            return;
        }
        if (
            typeof elem === 'object' &&
            elem != null &&
            typeof elem.request !== 'object' &&
            typeof elem.response !== 'object'
        ) {
            messages.push(`index[${index}] element should have request and response keys`);

            // eslint-disable-next-line no-useless-return
            return;
        }

        if (elem.request.path) {
            inValidMatcher(elem.request.path) && messages.push(`index[${index}] not valid path`);
        }

        inValidMatcher(elem.request.method) && messages.push(`index[${index}] not valid method`);

        if (elem.request.destination) {
            inValidMatcher(elem.request.destination) && messages.push(`index[${index}] not valid destination`);
        }

        if (elem.request.scheme) {
            inValidMatcher(elem.request.scheme) && messages.push(`index[${index}] not valid scheme`);
        }

        if (elem.request.body) {
            inValidMatcher(elem.request.body) && messages.push(`index[${index}] not valid body`);
        }

        const { headers, query, requiresState } = elem.request;
        if (headers && typeof headers === 'object' && Object.keys(headers).length > 0) {
            Object.entries(headers).forEach(([_, header]) => {
                inValidMatcher(header) && messages.push(`index[${index}] not valid headers`);
            });
        }

        if (query && typeof query === 'object' && Object.keys(query).length > 0) {
            Object.entries(query).forEach(([_, queryVal]) => {
                inValidMatcher(queryVal) && messages.push(`index[${index}] not valid query`);
            });
        }

        if (requiresState && typeof query === 'object' && Object.keys(query).length > 0) {
            Object.entries(requiresState).forEach(([_, state]) => {
                if (typeof state !== 'string') messages.push(`index[${index}] not valid requiresState`);
            });
        }

        if (typeof elem.response.status !== 'number') {
            messages.push(`index[${index}] not valid response.status`);
        }

        if (elem.response.fixedDelay != null && typeof elem.response.fixedDelay !== 'number') {
            messages.push(`index[${index}] not valid response.fixedDelay`);
        }

        if (typeof elem.response.body !== 'string') {
            messages.push(`index[${index}] not valid response.body`);
        }

        if (elem.response.encodedBody != null && typeof elem.response.encodedBody !== 'boolean') {
            messages.push(`index[${index}] not valid response.encodedBody`);
        }

        if (elem.response.headers != null && typeof elem.response.headers === 'object') {
            Object.entries(elem.response.headers).forEach(([_, state]) => {
                if (!Array.isArray(state)) messages.push(`index[${index}] not valid response.headers`);
            });
        }

        if (elem.response.templated != null && typeof elem.response.templated !== 'boolean') {
            messages.push(`index[${index}] not valid response.templated`);
        }

        if (elem.response.removesState != null) {
            !Array.isArray(elem.response.removesState) &&
                messages.push(`index[${index}] not valid response.removesState`);
        }

        if (elem.response.transitionsState != null && typeof elem.response.transitionsState === 'object') {
            Object.entries(elem.response.transitionsState).forEach(([_, state]) => {
                if (typeof state !== 'string') messages.push(`index[${index}] not valid response.transitionsState`);
            });
        }
    });

    if (messages.length > 0) {
        result.type = 'error';
        result.message = messages.join('<br />');
    }

    return result;
}
