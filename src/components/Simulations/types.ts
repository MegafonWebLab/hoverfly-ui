import type { HoverflyMatcher } from 'api/types';
import type { MirrorBodyType } from 'utils';

export type RouteItem = {
    name: string;
    method: string;
    index: number;
    isRequiresState: boolean;
    isNewState: boolean;
};

export type ServerState = {
    key?: string;
    value: string;
};

export type SimulationHeaderState = {
    match: string;
    key: string;
    value: string;
};

export type SimulationsServerState = {
    requiresState: ServerState[];
    transitionsState: ServerState[];
    removesState: ServerState[];
};

export type SimulationHeadersQueryState = {
    request: SimulationHeaderState[];
    response: SimulationHeaderState[];
    query: SimulationHeaderState[];
};

export type SimulationHtmlState = {
    request: Partial<HoverflyMatcher> & { type: MirrorBodyType };
    response: Partial<HoverflyMatcher> & { type: MirrorBodyType };
};

export type SimulationCodeMirrorOptions = {
    theme: string;
    lineNumbers: boolean;
    mode?:
        | string
        | {
              name: string;
              json: boolean;
          };
};
