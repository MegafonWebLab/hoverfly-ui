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

        return {
            name: `${pathValue}${isRequiresState ? ' [stateful]' : ''}`,
            index,
            method: method.toLowerCase(),
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

    newState.request.body =
        bodyState.request.length !== 0
            ? [{ value: bodyState.request[0].value, matcher: bodyState.request[0].matcher }]
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
