import React from 'react';
import { Checkbox, Grid, GridColumn, Header, Select } from '@megafon/ui-core';
import type { ISelectItem } from '@megafon/ui-core/dist/lib/components/Select/Select';
import { cnCreate } from '@megafon/ui-helpers';
import './ServerSettingsMode.pcss';
import { ReactComponent as Cancel } from '@megafon/ui-icons/system-16-cancel_16.svg';
import type { ModeState } from 'api/types';
import AccordionWrapper from 'components/AccordionWrapper/AccordionWrapper';
import { useDispatch, useSelector } from 'store/hooks';
import { getModeAsync, updateModeAsync } from 'store/mode/modeSlice';
import ServerSettingsButton from '../ServerSettingsButton/ServerSettingsButton';
import ServerSettingsTextField from '../ServerSettingsTextField/ServerSettingsTextField';

const modeWebser: ModeState['mode'][] = ['Simulate', 'Synthesize', 'Spy', 'Diff'];
const modeValues: ModeState['mode'][] = ['Capture', 'Diff', 'Modify', 'Simulate', 'Spy', 'Synthesize'];

const initialArguments: Required<ModeState['arguments']> = {
    matchingStrategy: '',
    headersWhitelist: [],
    stateful: false,
    overwriteDuplicate: false,
};

const cn = cnCreate('mode-info');
const ServerSettingsMode: React.FC = () => {
    const dispatch = useDispatch();
    const mainState = useSelector(state => state.main);
    const modeState = useSelector(state => state.mode);
    const statusState = useSelector(state => state.status.value);
    const mode = modeState.type === 'success' ? modeState.value.mode : 'Simulate';
    const isWebserver = mainState.type === 'success' ? mainState.value.isWebServer : false;
    const modeItems = isWebserver ? modeWebser : modeValues;

    const [modeValue, setModeState] = React.useState<ModeState['mode']>(mode);
    const [header, setHeader] = React.useState<string>('');
    const [argumentsState, setArgumentsState] = React.useState<Required<ModeState['arguments']>>(initialArguments);
    const { headersWhitelist, matchingStrategy } = argumentsState;
    const isCaptureMode = modeValue === 'Capture';
    const isShouldRenderHeaders = modeValue === 'Capture' || modeValue === 'Diff';

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

    function handleMatchingStrategyChange(e: React.ChangeEvent<HTMLInputElement>) {
        const trimmed = header.trim();
        if (trimmed) {
            setArgumentsState(state => ({
                ...state,
                matchingStrategy: e.target.value,
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
        const matching = modeValue === 'Simulate' ? 'strongest' : argumentsState.matchingStrategy;
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
    }, [modeState]);

    React.useEffect(() => {
        dispatch(getModeAsync());
    }, [dispatch]);

    const renderCaptureFields = (): JSX.Element => (
        <div className={cn('checkbox-list')}>
            <Checkbox checked={argumentsState.stateful} onChange={handleChangeCheckbox('stateful')}>
                Stateful
            </Checkbox>
            <Checkbox checked={argumentsState.overwriteDuplicate} onChange={handleChangeCheckbox('overwriteDuplicate')}>
                Overwrite Dups
            </Checkbox>
        </div>
    );

    const renderHostFields = (): JSX.Element => (
        <>
            <form onSubmit={handleSubmitHeader} className={cn('header-form')}>
                <ServerSettingsTextField
                    title="Headers"
                    value={header}
                    placeholder="Headers"
                    fieldSize="9"
                    headerSize="3"
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
        </>
    );

    const renderMatchingStrategy = (): JSX.Element => (
        <ServerSettingsTextField
            title="Matching strategy"
            value={matchingStrategy}
            placeholder="State key"
            fieldSize="9"
            headerSize="3"
            onChange={handleMatchingStrategyChange}
        />
    );

    return (
        <div className={cn()}>
            <AccordionWrapper title="Mode">
                <Grid hAlign="between">
                    <GridColumn all="1">
                        <Header className={cn('title')} as="h5">
                            Mode
                        </Header>
                    </GridColumn>
                    <GridColumn all="11">
                        <Select
                            className={cn('select')}
                            classes={{
                                control: cn('select-contol'),
                                list: cn('select-list'),
                            }}
                            currentValue={modeValue}
                            items={modeItems.map(item => ({
                                title: item,
                                value: item,
                            }))}
                            onSelect={handleChangeMode}
                        />
                    </GridColumn>
                </Grid>
                {isCaptureMode && renderCaptureFields()}
                <div className={cn('input-list')}>
                    {renderMatchingStrategy()}
                    {isShouldRenderHeaders && renderHostFields()}
                </div>
                <ServerSettingsButton text="Change Mode" disabled={!statusState} onClick={handleSubmit} />
            </AccordionWrapper>
        </div>
    );
};

export default ServerSettingsMode;
