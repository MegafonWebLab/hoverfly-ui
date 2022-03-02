import React, { useEffect, useState } from 'react';
import { Checkbox, Header, Select } from '@megafon/ui-core';
import type { ISelectItem } from '@megafon/ui-core/dist/lib/components/Select/Select';
import { cnCreate } from '@megafon/ui-helpers';
import MultiSelect from 'react-select/creatable';
import type { ModeState } from 'api/types';
import CollapseWrapper from 'components/CollapseWrapper/CollapseWrapper';
import { useDispatch, useSelector } from 'store/hooks';
import { getModeAsync, updateModeAsync } from 'store/mode/modeSlice';
import ServerSettingsButton from '../ServerSettingsButton/ServerSettingsButton';
import './ServerSettingsMode.pcss';

const modeWebser: ModeState['mode'][] = ['simulate', 'synthesize', 'spy', 'diff'];
const modeValues: ModeState['mode'][] = ['capture', 'diff', 'modify', 'simulate', 'spy', 'synthesize'];

const initialArguments: Required<ModeState['arguments']> = {
    matchingStrategy: '',
    headersWhitelist: [],
    stateful: false,
    overwriteDuplicate: false,
};

type MultiValue = {
    label: string;
    value: string;
};

type ChangeCheckboxFnType = (checked: boolean) => void;

const cn = cnCreate('mode-info');
const ServerSettingsMode: React.FC = (): JSX.Element => {
    const dispatch = useDispatch();

    const mainState = useSelector(state => state.main);
    const modeState = useSelector(state => state.mode);
    const statusState = useSelector(state => state.status.value);

    const isWebserver = mainState.type === 'success' ? mainState.value.isWebServer : false;
    const modeItems = isWebserver ? modeWebser : modeValues;

    const [modeValue, setModeState] = useState<ModeState['mode']>('simulate');
    const [argumentsState, setArgumentsState] = useState<Required<ModeState['arguments']>>(initialArguments);

    const { headersWhitelist, matchingStrategy, overwriteDuplicate, stateful } = argumentsState;
    const multiSelectOptions = headersWhitelist.map(header => ({
        value: header,
        label: header,
    }));

    const isCaptureMode = modeValue === 'capture';
    const isShouldRenderHeaders = modeValue === 'capture' || modeValue === 'diff';

    function handleMultiSelectChange(headerList: MultiValue[]): void {
        const newHeaders = headerList.map(({ value }) => value);

        setArgumentsState(state => ({
            ...state,
            headersWhitelist: newHeaders,
        }));
    }

    function handleChangeMode(_e: React.MouseEvent<HTMLDivElement>, item: ISelectItem<ModeState['mode']>): void {
        setModeState(item.value);
    }

    function handleChangeCheckbox(name: 'stateful' | 'overwriteDuplicate'): ChangeCheckboxFnType {
        return (): void => {
            setArgumentsState(state => ({
                ...state,
                [name]: !state[name],
            }));
        };
    }

    function handleSubmit(_e: React.MouseEvent<HTMLButtonElement>): void {
        const matching = modeValue === 'simulate' ? 'strongest' : matchingStrategy;
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
        if (modeState.type === 'success') {
            setModeState(modeState.value.mode);
        }
    }, [modeState.type, setModeState]);

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
                    classNamePrefix={cn('')}
                    className={cn('multi-select')}
                    isMulti
                    placeholder="Start typing and press Enter to add new"
                    value={multiSelectOptions}
                    options={multiSelectOptions}
                    onChange={handleMultiSelectChange}
                />
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
                            control: cn('select-control'),
                            list: cn('select-list'),
                        }}
                        currentValue={modeValue}
                        items={modeItems.map(item => ({
                            title: item.replace(/^\w/, item[0].toUpperCase()),
                            value: item,
                        }))}
                        onSelect={handleChangeMode}
                    />
                </div>
                {isCaptureMode && renderCaptureFields()}
                {isShouldRenderHeaders && renderHostFields()}
                <ServerSettingsButton text="Change Mode" disabled={!statusState} onClick={handleSubmit} />
            </CollapseWrapper>
        </div>
    );
};

export default ServerSettingsMode;
