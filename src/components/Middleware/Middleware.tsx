import React from 'react';
import { Button, Select, TextField } from '@megafon/ui-core';
import type { ISelectItem } from '@megafon/ui-core/dist/es/components/Select/Select';
import { cnCreate } from '@megafon/ui-helpers';
import { ReactComponent as Edit } from '@megafon/ui-icons/basic-16-edit_16.svg';
import './Middleware.pcss';
import AccordionWrapper from 'components/AccordionWrapper/AccordionWrapper';
import { useDispatch, useSelector } from 'store/hooks';
import { getMiddlewareAsync, updateMiddlewareAsync } from 'store/middleware/middlewareSlice';

type MiddlewareModeState = 'binary' | 'remote';

const modes: MiddlewareModeState[] = ['binary', 'remote'];

type MiddlewareState = Record<'binary' | 'script' | 'remote', { value: string; edited: boolean }>;

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
const Middleware: React.FC = () => {
    const dispatch = useDispatch();
    const statusState = !!useSelector(state => state.status.value);
    const middleware = useSelector(state => state.middleware);

    const [mode, setMode] = React.useState<MiddlewareModeState>('binary');
    const [state, setState] = React.useState<MiddlewareState>(initialState);

    function handleChangeMode(_e: React.MouseEvent<HTMLDivElement>, item: ISelectItem<MiddlewareModeState>): void {
        setMode(item.value);
    }

    function handleChangeState(name: 'binary' | 'script' | 'remote') {
        return (e: React.ChangeEvent<HTMLInputElement>) => {
            setState(prevState => ({ ...prevState, [name]: { ...prevState[name], value: e.target.value } }));
        };
    }

    function handleClickEdit(name: 'binary' | 'script' | 'remote') {
        return (_e: React.MouseEvent<HTMLButtonElement>) => {
            setState(prevState => ({
                ...prevState,
                [name]: { ...prevState[name], edited: !prevState[name].edited },
            }));
        };
    }

    function handleClickSubmit(_e: React.MouseEvent<HTMLButtonElement>): void {
        const formData =
            mode === 'binary'
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

    const renderEditButton = (name: 'binary' | 'script' | 'remote') => (
        <Button
            className={cn('icon-button')}
            theme="purple"
            sizeAll="small"
            icon={<Edit className={cn('edit-icon')} />}
            onClick={handleClickEdit(name)}
        />
    );

    const renderBinary = (
        <>
            <tr>
                <td className={cn('cell')} width="45%">
                    <div className={cn('cell-box')}>
                        {renderEditButton('binary')}
                        Binary
                    </div>
                </td>
                <td className={cn('cell')}>
                    {state.binary.edited ? (
                        <TextField
                            classes={{ input: cn('field') }}
                            value={state.binary.value}
                            onChange={handleChangeState('binary')}
                        />
                    ) : (
                        <div className={cn('cell-text')}>{state.binary.value}</div>
                    )}
                </td>
            </tr>
            <tr>
                <td className={cn('cell')} width="45%">
                    <div className={cn('cell-box')}>
                        {renderEditButton('script')}
                        Script
                    </div>
                </td>
                <td className={cn('cell')}>
                    {state.script.edited ? (
                        <TextField
                            classes={{ input: cn('textarea') }}
                            value={state.script.value}
                            textarea="flexible"
                            onChange={handleChangeState('script')}
                        />
                    ) : (
                        <div className={cn('cell-text')}>{state.script.value}</div>
                    )}
                </td>
            </tr>
        </>
    );

    const renderRemote = (
        <tr>
            <td className={cn('cell')} width="45%">
                <div className={cn('cell-box')}>
                    {renderEditButton('remote')}
                    Remote
                </div>
            </td>
            <td className={cn('cell')}>
                {state.remote.edited ? (
                    <TextField
                        classes={{ input: cn('field') }}
                        value={state.remote.value}
                        onChange={handleChangeState('remote')}
                    />
                ) : (
                    <div className={cn('cell-text')}>{state.remote.value}</div>
                )}
            </td>
        </tr>
    );

    return (
        <div className={cn()}>
            <AccordionWrapper title="Middleware">
                <table className={cn('table')}>
                    <tbody>
                        <tr>
                            <td className={cn('cell')} width="45%">
                                Mode
                            </td>
                            <td className={cn('cell')}>
                                <Select
                                    classes={{
                                        control: cn('select-contol'),
                                        listItemTitle: cn('select-item-title'),
                                        titleInner: cn('select-title-inner'),
                                    }}
                                    currentValue={mode}
                                    items={modes.map(m => ({
                                        title: m,
                                        value: m,
                                    }))}
                                    onSelect={handleChangeMode}
                                />
                            </td>
                        </tr>
                        {mode === 'binary' && renderBinary}
                        {mode === 'remote' && renderRemote}
                    </tbody>
                </table>
                <div className={cn('footer')}>
                    <Button
                        className={cn('button')}
                        sizeAll="small"
                        disabled={!statusState}
                        onClick={handleClickSubmit}
                    >
                        Change
                    </Button>
                </div>
            </AccordionWrapper>
        </div>
    );
};

export default Middleware;
