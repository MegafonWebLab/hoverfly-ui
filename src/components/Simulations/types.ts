import type { HoverflyMatcher } from 'api/types';

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

export type BodyType = 'xml' | 'json' | 'html' | 'text' | '';

export type SimulationHtmlState = {
    request: Array<HoverflyMatcher & { type: BodyType }>;
    response: Partial<HoverflyMatcher> & { type: BodyType };
};

export type SimulationCodeMirrorOptions = {
    theme: 'material';
    lineNumbers: boolean;
    mode?:
        | string
        | {
              name: string;
              json: boolean;
          };
};
