import React from 'react';
import { Select } from '@megafon/ui-core';
import type { ISelectItem } from '@megafon/ui-core/dist/es/components/Select/Select';
import { cnCreate } from '@megafon/ui-helpers';
import CollapseWrapper from 'components/CollapseWrapper/CollapseWrapper';
import { useDispatch, useSelector } from 'store/hooks';
import { getMiddlewareAsync, updateMiddlewareAsync } from 'store/middleware/middlewareSlice';
import ServerSettingsButton from '../ServerSettingsButton/ServerSettingsButton';
import './ServerSettingsMiddleware.pcss';
import ServerSettingsTextField from '../ServerSettingsTextField/ServerSettingsTextField';

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

    const [mode, setMode] = React.useState<MiddlewareModeState>('Binary');
    const [state, setState] = React.useState<MiddlewareState>(initialState);

    function handleChangeMode(_e: React.MouseEvent<HTMLDivElement>, item: ISelectItem<MiddlewareModeState>): void {
        setMode(item.value);
    }

    function handleChangeState(name: 'binary' | 'script' | 'remote') {
        return (e: React.ChangeEvent<HTMLInputElement>) => {
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

    React.useEffect(() => {
        if (middleware.type === 'success') {
            setState({
                binary: {
                    value: middleware.value.binary,
                    edited: false,
                },
                script: {
                    value: middleware.value.script,
                    edited: false,
                },
                remote: {
                    value: middleware.value.remote,
                    edited: false,
                },
            });
        }
    }, [middleware]);

    React.useEffect(() => {
        statusState && dispatch(getMiddlewareAsync());
    }, [statusState, dispatch]);

    const renderBinary = (): JSX.Element => (
        <div className={cn('binary-fields')}>
            <ServerSettingsTextField
                title="Binary path"
                value={state.binary.value}
                placeholder="State key"
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
            value={state.remote.value}
            placeholder="localhost"
            onChange={handleChangeState('remote')}
        />
    );

    return (
        <div className={cn()}>
            <CollapseWrapper title="Middleware">
                <Select
                    classes={{
                        control: cn('select-contol'),
                    }}
                    currentValue={mode}
                    items={modes.map(m => ({
                        title: m,
                        value: m,
                    }))}
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
