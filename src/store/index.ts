import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import api from 'api';
import cache from './cache/cacheSlice';
import main from './main/mainSlice';
import middleware from './middleware/middlewareSlice';
import mode from './mode/modeSlice';
import destination from './proxy/destinationSlice';
import upstreamProxy from './proxy/upstreamProxySlice';
import serverState from './serverState/serverStateSlice';
import shutdown from './shutdown/shutdownSlice';
import status from './status/statusSlice';

export const store = configureStore({
    reducer: {
        main,
        shutdown,
        cache,
        status,
        serverState,
        mode,
        middleware,
        destination,
        upstreamProxy,
    },
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware({
            thunk: {
                extraArgument: api,
            },
            serializableCheck: false,
        }),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;
