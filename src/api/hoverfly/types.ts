import { IRequestResponse } from '../types';

export type MainInfo = {
    cors: {
        enabled: boolean;
        allowOrigin?: string;
        allowMethods?: string;
        allowHeaders?: string;
        preflightMaxAge?: number;
        allowCredentials?: boolean;
    };
    destination: string;
    middleware?: {
        binary: string;
        script: string;
        remote: string;
    };
    mode: string;
    arguments: {
        matchingStrategy: string;
    };
    isWebServer: boolean;
    usage: {
        counters: {
            capture: number;
            diff: number;
            modify: number;
            simulate: number;
            spy: number;
            synthesize: number;
        };
    };
    version: string;
    upstreamProxy: string;
};

export interface IHoverflyApi {
    fetchMainInfo(): Promise<IRequestResponse<MainInfo>>;
}
