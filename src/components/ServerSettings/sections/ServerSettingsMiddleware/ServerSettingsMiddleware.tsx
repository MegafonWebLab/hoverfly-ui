import React from 'react';
import { Header, Select, TextField } from '@megafon/ui-core';
import type { ISelectItem } from '@megafon/ui-core/dist/es/components/Select/Select';
import { cnCreate } from '@megafon/ui-helpers';
import { useDispatch, useSelector } from 'store/hooks';
import { getMiddlewareAsync, updateMiddlewareAsync } from 'store/middleware/middlewareSlice';
import AccordionWrapper from 'components/AccordionWrapper/AccordionWrapper';
import ServerSettingsButton from '../ServerSettingsButton/ServerSettingsButton';
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
    }, [middleware.type]);

    React.useEffect(() => {
        statusState && dispatch(getMiddlewareAsync());
    }, [statusState]);

    const renderBinary = (
        <>
            <div className={cn('mode')}>
                <Header className={cn('mode-title')} as="h5">Binary path</Header>
                <TextField
                    className={cn('field')}
                    classes={{ input: cn('input') }}
                    value={state.binary.value}
                    placeholder='State key'
                    onChange={handleChangeState('binary')}
                />
            </div>
            <div className={cn('mode-script')}>
                <Header className={cn('mode-title')} as="h5">Script</Header>
                <TextField
                    className={cn('field')}
                    classes={{ input: cn('textarea') }}
                    value={state.script.value}
                    textarea="fixed"
                    onChange={handleChangeState('script')}
                />
            </div>
        </>
    );

    const renderRemote = (
        <div className={cn('mode')}>
            <Header className={cn('mode-title')} as="h5">URL</Header>
            <TextField
                className={cn('field')}
                classes={{ input: cn('input') }}
                value={state.remote.value}
                placeholder='localhost'
                onChange={handleChangeState('remote')}
            />
        </div>
    );

    return (
        <div className={cn()}>
            <AccordionWrapper title="Middleware">
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
                {mode === 'Binary' && renderBinary}
                {mode === 'Remote' && renderRemote}
                <ServerSettingsButton
                    text='Change Middleware'
                    disabled={!statusState}
                    onClick={handleClickSubmit}
                />
            </AccordionWrapper>
        </div>
    );
};

export default ServerSettingsMiddleware;
