export interface IRequestStateIdle {
    type: 'idle';
}
export interface IRequestStatePending {
    type: 'pending';
}
export interface IRequestStateFailed {
    error: string;
    type: 'failed';
}
export interface IRequestStateSuccess<T> {
    value: T;
    type: 'success';
}

export type IRequestState<T = null> =
    | IRequestStateSuccess<T>
    | IRequestStateIdle
    | IRequestStatePending
    | IRequestStateFailed;
