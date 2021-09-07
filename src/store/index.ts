import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import api from '../api';
import main from './main/mainSlice';

export const store = configureStore({
    reducer: {
        main,
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
