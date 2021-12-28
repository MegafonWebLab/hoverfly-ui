import React from 'react';
import { Checkbox, Select, Button, TextField } from '@megafon/ui-core';
import type { ISelectItem } from '@megafon/ui-core/dist/lib/components/Select/Select';
import { cnCreate } from '@megafon/ui-helpers';
import './ModeInfo.pcss';
import { ReactComponent as Cancel } from '@megafon/ui-icons/system-16-cancel_16.svg';
import type { ModeState } from 'api/types';
import AccordionWrapper from 'components/AccordionWrapper/AccordionWrapper';
import { useDispatch, useSelector } from 'store/hooks';
import { getModeAsync, updateModeAsync } from 'store/mode/modeSlice';

const modeWebser: ModeState['mode'][] = ['simulate', 'synthesize', 'spy', 'diff'];
const modeValues: ModeState['mode'][] = ['simulate', 'synthesize', 'modify', 'capture', 'spy', 'diff'];

const initialArguments: Required<ModeState['arguments']> = {
    matchingStrategy: '',
    headersWhitelist: [],
    stateful: false,
    overwriteDuplicate: false,
};

const cn = cnCreate('mode-info');
const ModeInfo: React.FC = () => {
    const dispatch = useDispatch();
    const mainState = useSelector(state => state.main);
    const modeState = useSelector(state => state.mode);
    const statusState = useSelector(state => state.status.value);
    const mode = modeState.type === 'success' ? modeState.value.mode : 'simulate';
    const isWebserver = mainState.type === 'success' ? mainState.value.isWebServer : false;
    const modeItems = isWebserver ? modeWebser : modeValues;

    const [modeValue, setModeState] = React.useState<ModeState['mode']>(mode);
    const [header, setHeader] = React.useState<string>('');
    const [argumentsState, setArgumentsState] = React.useState<Required<ModeState['arguments']>>(initialArguments);
    const { headersWhitelist } = argumentsState;
    const isCaptureMode = modeValue === 'capture';
    const isShouldRenderHeaders = modeValue === 'capture' || modeValue === 'diff';

    function handleChangeMode(_e: React.MouseEvent<HTMLDivElement>, item: ISelectItem<ModeState['mode']>) {
        setModeState(item.value);
    }

    function handleChangeCheckbox(name: 'stateful' | 'overwriteDuplicate') {
        return (_e: React.ChangeEvent<HTMLInputElement>) => {
            setArgumentsState(state => ({
                ...state,
                [name]: !state[name],
            }));
        };
    }

    function handleSubmitHeader(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const trimmed = header.trim();
        if (trimmed) {
            setArgumentsState(state => ({
                ...state,
                headersWhitelist: [...state.headersWhitelist.filter(h => h !== trimmed), trimmed],
            }));
            setHeader('');
        }
    }

    function handleChangeHeader(e: React.ChangeEvent<HTMLInputElement>) {
        setHeader(e.target.value);
    }

    function handleClickCancelHeader(index: number) {
        return (_e: React.MouseEvent<SVGElement>) => {
            const newHeaders = [...headersWhitelist];
            newHeaders.splice(index, 1);

            setArgumentsState(state => ({ ...state, headersWhitelist: newHeaders }));
        };
    }

    function handleSubmit(_e: React.MouseEvent<HTMLButtonElement>) {
        const matching = modeValue === 'simulate' ? 'strongest' : argumentsState.matchingStrategy;
        const content: ModeState = {
            mode: modeValue,
            arguments: {
                ...argumentsState,
                matchingStrategy: matching,
            },
        };

        dispatch(updateModeAsync(content));
    }

    React.useEffect(() => {
        setModeState(mode);
    }, [mode]);

    React.useEffect(() => {
        if (modeState.type === 'success') {
            const argumentsStore: Required<ModeState['arguments']> =
                modeState.type === 'success' ? { ...initialArguments, ...modeState.value.arguments } : initialArguments;
            setArgumentsState(argumentsStore);
        }
    }, [modeState.type === 'success']);

    React.useEffect(() => {
        dispatch(getModeAsync());
    }, []);

    const renderCaptureFields = (
        <>
            <tr>
                <td className={cn('cell')} width="45%">
                    Stateful
                </td>
                <td className={cn('cell')}>
                    <Checkbox checked={argumentsState.stateful} onChange={handleChangeCheckbox('stateful')} />
                </td>
            </tr>
            <tr>
                <td className={cn('cell')} width="45%">
                    Overwrite Dups
                </td>
                <td className={cn('cell')}>
                    <Checkbox
                        checked={argumentsState.overwriteDuplicate}
                        onChange={handleChangeCheckbox('overwriteDuplicate')}
                    />
                </td>
            </tr>
        </>
    );

    const renderHostFields = (
        <tr>
            <td className={cn('cell')} width="45%">
                Headers
            </td>
            <td className={cn('cell')}>
                <form onSubmit={handleSubmitHeader} className={cn('header-form')}>
                    <TextField
                        classes={{
                            input: cn('header-field'),
                        }}
                        value={header}
                        onChange={handleChangeHeader}
                    />
                </form>
                <div className={cn('headers', { 'not-empty': !!headersWhitelist.length })}>
                    {argumentsState.headersWhitelist.map((h, index) => (
                        <div key={h} className={cn('header')}>
                            <span className={cn('header-name')}>{h}</span>{' '}
                            <Cancel className={cn('cancel-icon')} onClick={handleClickCancelHeader(index)} />
                        </div>
                    ))}
                </div>
            </td>
        </tr>
    );

    return (
        <div className={cn()}>
            <AccordionWrapper title="Mode">
                <table>
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
                                    currentValue={modeValue}
                                    items={modeItems.map(item => ({
                                        title: item,
                                        value: item,
                                    }))}
                                    onSelect={handleChangeMode}
                                />
                            </td>
                        </tr>
                        {isCaptureMode && renderCaptureFields}
                        {isShouldRenderHeaders && renderHostFields}
                    </tbody>
                </table>
                <div className={cn('submit-wrapper')}>
                    <Button sizeAll="small" disabled={!statusState} onClick={handleSubmit}>
                        Change
                    </Button>
                </div>
            </AccordionWrapper>
        </div>
    );
};

export default ModeInfo;
