import React, { useEffect, useState } from 'react';
import { Checkbox, Header, Select } from '@megafon/ui-core';
import type { ISelectItem } from '@megafon/ui-core/dist/lib/components/Select/Select';
import { cnCreate } from '@megafon/ui-helpers';
import { ReactComponent as Cancel } from '@megafon/ui-icons/system-16-cancel_16.svg';
import { MultiSelect } from 'react-multi-select-component';
import type { ModeState } from 'api/types';
import CollapseWrapper from 'components/CollapseWrapper/CollapseWrapper';
import { useDispatch, useSelector } from 'store/hooks';
import { getModeAsync, updateModeAsync } from 'store/mode/modeSlice';
import ServerSettingsButton from '../ServerSettingsButton/ServerSettingsButton';
import './ServerSettingsMode.pcss';

const modeWebser: ModeState['mode'][] = ['Simulate', 'Synthesize', 'Spy', 'Diff'];
const modeValues: ModeState['mode'][] = ['Capture', 'Diff', 'Modify', 'Simulate', 'Spy', 'Synthesize'];

const initialArguments: Required<ModeState['arguments']> = {
    matchingStrategy: '',
    headersWhitelist: [],
    stateful: false,
    overwriteDuplicate: false,
};

type Option = {
    label: string;
    value: string;
};

type ChangeCheckboxFnType = (_e: React.ChangeEvent<HTMLInputElement>) => void;
type ClickCancelHeaderFnType = (_e: React.MouseEvent<SVGElement>) => void;

const cn = cnCreate('mode-info');
const ServerSettingsMode: React.FC = (): JSX.Element => {
    const dispatch = useDispatch();

    const mainState = useSelector(state => state.main);
    const modeState = useSelector(state => state.mode);
    const statusState = useSelector(state => state.status.value);

    const isWebserver = mainState.type === 'success' ? mainState.value.isWebServer : false;
    const mode = modeState.type === 'success' ? modeState.value.mode : 'Simulate';
    const modeItems = isWebserver ? modeWebser : modeValues;

    const [headers, setHeaders] = useState<Option[]>([]);
    const [modeValue, setModeState] = useState<ModeState['mode']>(mode);
    const [argumentsState, setArgumentsState] = useState<Required<ModeState['arguments']>>(initialArguments);

    const { headersWhitelist, matchingStrategy, overwriteDuplicate, stateful } = argumentsState;

    const isCaptureMode = modeValue === 'Capture';
    const isShouldRenderHeaders = modeValue === 'Capture' || modeValue === 'Diff';

    function handleMultiSelectCreateOption(value: string): Option {
        return {
            label: value,
            value,
        };
    }

    function handleMultiSelectChange(list: Option[]): void {
        setHeaders(list);

        if (!list.length) {
            return setArgumentsState(state => ({
                ...state,
                headersWhitelist: [],
            }));
        }

        const lastValue = list[list.length - 1].value;

        return setArgumentsState(state => ({
            ...state,
            headersWhitelist: [...state.headersWhitelist.filter(h => h !== lastValue), lastValue],
        }));
    }

    function handleChangeMode(_e: React.MouseEvent<HTMLDivElement>, item: ISelectItem<ModeState['mode']>): void {
        setModeState(item.value);
    }

    function handleChangeCheckbox(name: 'stateful' | 'overwriteDuplicate'): ChangeCheckboxFnType {
        return (_e: React.ChangeEvent<HTMLInputElement>): void => {
            setArgumentsState(state => ({
                ...state,
                [name]: !state[name],
            }));
        };
    }

    function handleClickCancelHeader(index: number): ClickCancelHeaderFnType {
        return (_e: React.MouseEvent<SVGElement>): void => {
            const newHeaders = [...headersWhitelist];

            newHeaders.splice(index, 1);
            headers.splice(index, 1);

            setArgumentsState(state => ({ ...state, headersWhitelist: newHeaders }));
            setHeaders(headers);
        };
    }

    function handleSubmit(_e: React.MouseEvent<HTMLButtonElement>): void {
        const matching = modeValue === 'Simulate' ? 'strongest' : matchingStrategy;
        const content: ModeState = {
            mode: modeValue,
            arguments: {
                ...argumentsState,
                matchingStrategy: matching,
            },
        };

        dispatch(updateModeAsync(content));
    }

    useEffect(() => {
        setModeState(mode);
    }, [mode]);

    useEffect(() => {
        if (modeState.type === 'success') {
            const argumentsStore: Required<ModeState['arguments']> =
                modeState.type === 'success' ? { ...initialArguments, ...modeState.value.arguments } : initialArguments;
            setArgumentsState(argumentsStore);
        }
    }, [modeState]);

    useEffect(() => {
        dispatch(getModeAsync());
    }, [dispatch]);

    const renderCaptureFields = (): JSX.Element => (
        <div className={cn('checkbox-list')}>
            <Checkbox checked={stateful} onChange={handleChangeCheckbox('stateful')}>
                Stateful
            </Checkbox>
            <Checkbox checked={overwriteDuplicate} onChange={handleChangeCheckbox('overwriteDuplicate')}>
                Overwrite Dups
            </Checkbox>
        </div>
    );

    const renderHostFields = (): JSX.Element => (
        <div className={cn('host-fields')}>
            <Header className={cn('title')} as="h5">
                Headers
            </Header>
            <div className={cn('multi-select-container')}>
                <MultiSelect
                    isCreatable
                    options={[]}
                    value={headers}
                    labelledBy="Select headers"
                    className={cn('multi-select')}
                    onChange={handleMultiSelectChange}
                    onCreateOption={handleMultiSelectCreateOption}
                    overrideStrings={{ selectSomeItems: 'Headers' }}
                />
                <div className={cn('headers', { 'not-empty': !!headersWhitelist.length })}>
                    {headersWhitelist.map((title, index) => (
                        <div key={title} className={cn('header-item')}>
                            <span className={cn('header-name')}>{title}</span>{' '}
                            <Cancel className={cn('cancel-icon')} onClick={handleClickCancelHeader(index)} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className={cn()}>
            <CollapseWrapper title="Mode">
                <div className={cn('select-wrapper')}>
                    <Header className={cn('title')} as="h5">
                        Mode
                    </Header>
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
                </div>
                {isCaptureMode && renderCaptureFields()}
                {!isShouldRenderHeaders && renderHostFields()}
                <ServerSettingsButton text="Change Mode" disabled={!statusState} onClick={handleSubmit} />
            </CollapseWrapper>
        </div>
    );
};

export default ServerSettingsMode;
