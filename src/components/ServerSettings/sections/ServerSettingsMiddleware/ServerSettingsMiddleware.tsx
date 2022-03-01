import React, { useEffect, useState } from 'react';
import { Select } from '@megafon/ui-core';
import type { ISelectItem } from '@megafon/ui-core/dist/es/components/Select/Select';
import { cnCreate } from '@megafon/ui-helpers';
import CollapseWrapper from 'components/CollapseWrapper/CollapseWrapper';
import { useDispatch, useSelector } from 'store/hooks';
import { getMiddlewareAsync, updateMiddlewareAsync } from 'store/middleware/middlewareSlice';
import ServerSettingsButton from '../ServerSettingsButton/ServerSettingsButton';
import ServerSettingsTextField from '../ServerSettingsTextField/ServerSettingsTextField';
import './ServerSettingsMiddleware.pcss';

type MiddlewareModeState = 'Binary' | 'Remote';
type MiddlewareState = Record<'binary' | 'script' | 'remote', { value: string; edited: boolean }>;

const modes: MiddlewareModeState[] = ['Binary', 'Remote'];

const initialState: MiddlewareState = {
    binary: {
        value: '',
        edited: false,
    },
    script: {
        value: '',
        edited: false,
    },
    remote: {
        value: '',
        edited: false,
    },
};

const cn = cnCreate('middleware');
const ServerSettingsMiddleware: React.FC = () => {
    const dispatch = useDispatch();

    const statusState = !!useSelector(state => state.status.value);
    const middleware = useSelector(state => state.middleware);

    const [mode, setMode] = useState<MiddlewareModeState>('Binary');
    const [state, setState] = useState<MiddlewareState>(initialState);

    function handleChangeMode(_e: React.MouseEvent<HTMLDivElement>, item: ISelectItem<MiddlewareModeState>): void {
        setMode(item.value);
    }

    function handleChangeState(name: 'binary' | 'script' | 'remote') {
        return (e: React.ChangeEvent<HTMLInputElement>): void => {
            setState(prevState => ({ ...prevState, [name]: { ...prevState[name], value: e.target.value } }));
        };
    }

    function handleClickSubmit(_e: React.MouseEvent<HTMLButtonElement>): void {
        const formData =
            mode === 'Binary'
                ? {
                      binary: state.binary.value,
                      script: state.script.value,
                      remote: '',
                  }
                : {
                      binary: '',
                      script: '',
                      remote: state.remote.value,
                  };

        dispatch(updateMiddlewareAsync(formData));
    }

    useEffect(() => {
        if (middleware.type === 'success') {
            const { binary, script, remote } = middleware.value;

            setState({
                binary: { value: binary, edited: false },
                script: { value: script, edited: false },
                remote: { value: remote, edited: false },
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [middleware.type]);

    useEffect(() => {
        statusState && dispatch(getMiddlewareAsync());
    }, [statusState, dispatch]);

    const renderBinary = (): JSX.Element => (
        <div className={cn('binary-fields')}>
            <ServerSettingsTextField
                title="Binary path"
                placeholder="/usr/local/bin/python3"
                value={state.binary.value}
                onChange={handleChangeState('binary')}
            />
            <ServerSettingsTextField
                textarea
                title="Script"
                value={state.script.value}
                onChange={handleChangeState('script')}
            />
        </div>
    );

    const renderRemote = (): JSX.Element => (
        <ServerSettingsTextField
            title="URL"
            placeholder="localhost"
            value={state.remote.value}
            onChange={handleChangeState('remote')}
        />
    );

    return (
        <div className={cn()}>
            <CollapseWrapper title="Middleware">
                <Select
                    classes={{ control: cn('select-contol') }}
                    items={modes.map(modesItem => ({
                        title: modesItem,
                        value: modesItem,
                    }))}
                    currentValue={mode}
                    onSelect={handleChangeMode}
                />
                {mode === 'Binary' && renderBinary()}
                {mode === 'Remote' && renderRemote()}
                <ServerSettingsButton text="Change Middleware" disabled={!statusState} onClick={handleClickSubmit} />
            </CollapseWrapper>
        </div>
    );
};

export default ServerSettingsMiddleware;
