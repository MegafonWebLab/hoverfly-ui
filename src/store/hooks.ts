import type { AnyAction, Dispatch, Store, ThunkDispatch } from '@reduxjs/toolkit';
import {
    TypedUseSelectorHook,
    useDispatch as moduleDispatch,
    useSelector as moduleSelector,
    useStore as moduleStore,
} from 'react-redux';
import type { ApiType } from '../api';
import type { RootState, AppDispatch } from '.';

export const useDispatch = (): ThunkDispatch<RootState, ApiType, AnyAction> & Dispatch<AnyAction> =>
    moduleDispatch<AppDispatch>();
export const useStore = (): Store<RootState, AnyAction> => moduleStore<RootState>();
export const useSelector: TypedUseSelectorHook<RootState> = moduleSelector;
