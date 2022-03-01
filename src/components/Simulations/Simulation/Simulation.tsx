import React, { useMemo, useEffect, useCallback, useState } from 'react';
import { Button, Checkbox, Header, Select, TextField } from '@megafon/ui-core';
import type { ISelectItem } from '@megafon/ui-core/dist/lib/components/Select/Select';
import { cnCreate } from '@megafon/ui-helpers';
import { ReactComponent as ArrowIcon } from '@megafon/ui-icons/system-16-arrow_left_16.svg';
import { ReactComponent as Minus } from '@megafon/ui-icons/system-16-minus_16.svg';
import { Controlled as CodeMirror } from 'react-codemirror2';
import type { SimulationResponse, HoverflyMatcher, PairItemRequest, SimulationItem, PairItemResponse } from 'api/types';
import CollapseWrapper from 'components/CollapseWrapper/CollapseWrapper';
import './Simulation.pcss';
import { useSelector } from 'store/hooks';
import { hightlightHtml, MirrorBodyType } from 'utils';
import {
    BODY_FORMATS,
    headerEmpty,
    initialBodyState,
    initialHeaderQuery,
    initialPairState,
    initialServerState,
    initialState,
    MATCHES,
    METHODS,
    serverStateEmpty,
    STATUS_CODES,
} from '../constants';
import type {
    ServerState,
    SimulationsServerState,
    SimulationHeadersQueryState,
    SimulationHeaderState,
    SimulationHtmlState,
} from '../types';
import {
    addOrRemoveEl,
    changeCurrentPairRequest,
    changeCurrentPairResponse,
    changeHeaderState,
    changeServerState,
    getCodeMirrorConfig,
    getRemoveStateList,
    getRequestHeadersStateList,
    getRequestQueryStateList,
    getRequireStateList,
    getResponseHeaderStateList,
    getTransitionStateList,
    mergeBodyStateToCurrentPair,
    mergeCurrentStateToMainState,
    mergeHeaderStateToCurrentPair,
    mergeServerStateToCurrentPair,
} from '../utils';

import 'codemirror/lib/codemirror.css';
import SimulationFieldsBlock from './SimulationFieldsBlock/SimulationFieldsBlock';

require('codemirror/mode/xml/xml');
require('codemirror/mode/javascript/javascript');
require('codemirror/mode/htmlmixed/htmlmixed');

type InputChange = React.ChangeEvent<HTMLInputElement>;
type ChangeCurrentNames = keyof Omit<PairItemRequest, 'headers' | 'query' | 'requiresState'>;

// eslint-disable-next-line react-hooks/exhaustive-deps
const useZeroMemo = (el: JSX.Element) => useMemo(() => el, []);

interface ISimulationProps {
    routeIndex?: number;
    onChange: (state: SimulationResponse) => void;
    onBack: () => void;
}

const cn = cnCreate('simulation');
const Simulation: React.FC<ISimulationProps> = ({ routeIndex, onBack, onChange }) => {
    const simulationStore = useSelector(state => state.simulation);

    const [state, setState] = useState<SimulationResponse>(() => {
        if (simulationStore.type === 'success') {
            return simulationStore.value;
        }

        return initialState;
    });
    const [serverState, setServerState] = useState<SimulationsServerState>(initialServerState);
    const [currentPair, setCurrentPair] = useState<SimulationItem | undefined>(initialPairState);
    const [headerQuery, setHeaderQuery] = useState<SimulationHeadersQueryState>(initialHeaderQuery);
    const [body, setBody] = useState<SimulationHtmlState>(initialBodyState);

    const { transitionsState, requiresState } = serverState;

    function handleSubmit() {
        if (state) {
            const pair = currentPair
                ? mergeServerStateToCurrentPair(
                      mergeHeaderStateToCurrentPair(mergeBodyStateToCurrentPair(currentPair, body), headerQuery),
                      serverState,
                  )
                : null;
            const newState = pair
                ? mergeCurrentStateToMainState(
                      state,
                      pair,
                      routeIndex !== undefined ? routeIndex : state.data.pairs.length,
                  )
                : state;
            onChange(newState);
        }
    }

    function handleToggleServerState(key: keyof SimulationsServerState, index?: number) {
        return () =>
            setServerState(prev => ({
                ...prev,
                [key]: addOrRemoveEl(prev[key], { add: serverStateEmpty, remove: index }),
            }));
    }

    function handleChangeServerState(key: keyof SimulationsServerState, name: keyof ServerState, index: number) {
        return (e: InputChange) => setServerState(prev => changeServerState(prev, key, name, index, e.target.value));
    }

    function handleToggleHeaderQuery(key: keyof SimulationHeadersQueryState, index?: number) {
        return () =>
            setHeaderQuery(prev => ({
                ...prev,
                [key]: addOrRemoveEl(prev[key], { add: headerEmpty, remove: index }),
            }));
    }

    function handleChangeHeaderQuery(
        key: keyof SimulationHeadersQueryState,
        name: keyof SimulationHeaderState,
        index: number,
    ) {
        return (e: InputChange) => setHeaderQuery(prev => changeHeaderState(prev, key, name, index, e.target.value));
    }

    function handleChooseHeaderQuery(key: keyof SimulationHeadersQueryState, index: number) {
        return (_e: React.MouseEvent<HTMLDivElement>, dataItem?: ISelectItem<string>) => {
            setHeaderQuery(prev => changeHeaderState(prev, key, 'match', index, dataItem?.value || ''));
        };
    }

    function handleChooseCurrentValueRequest(name: ChangeCurrentNames, key: keyof HoverflyMatcher) {
        return (_e: React.MouseEvent<HTMLDivElement>, dataItem?: ISelectItem<string>) => {
            setCurrentPair(prev => changeCurrentPairRequest(prev, name, key, dataItem?.value || ''));
        };
    }

    function handleChangeCurrentRequest(name: ChangeCurrentNames, key: keyof HoverflyMatcher) {
        return (e: InputChange) => setCurrentPair(prev => changeCurrentPairRequest(prev, name, key, e.target.value));
    }

    function handleChooseCurrentResponse(name: keyof PairItemResponse) {
        return (_e: React.MouseEvent<HTMLDivElement>, dataItem?: ISelectItem<number>) => {
            setCurrentPair(prev => changeCurrentPairResponse(prev, name, dataItem?.value || 0));
        };
    }

    function handleChangeResponseCheckbox(name: keyof Pick<PairItemResponse, 'encodedBody' | 'templated'>) {
        return () => setCurrentPair(prev => changeCurrentPairResponse(prev, name, !prev?.response[name]));
    }

    function handleChooseBodyType(key: keyof SimulationHtmlState) {
        return (_e: React.MouseEvent<HTMLDivElement>, dataItem?: ISelectItem<MirrorBodyType>) => {
            setBody(prev => ({ ...prev, [key]: { ...prev[key], type: dataItem?.value } }));
        };
    }

    function handleChangeBody(key: keyof SimulationHtmlState) {
        return (_editor: unknown, _data: unknown, value: string) => {
            setBody(prev => {
                const newState = key === 'request' ? [{ ...prev[key][0], value }] : { ...prev[key], value };

                return { ...prev, [key]: newState };
            });
        };
    }

    useEffect(() => {
        simulationStore.type === 'success' && setState(simulationStore.value);
    }, [simulationStore]);

    useEffect(() => {
        if (routeIndex !== undefined && state) {
            const pair = state.data.pairs[routeIndex];

            const content: SimulationsServerState = {
                requiresState: getRequireStateList(pair),
                transitionsState: getTransitionStateList(pair),
                removesState: getRemoveStateList(pair),
            };
            const headers: SimulationHeadersQueryState = {
                request: getRequestHeadersStateList(pair),
                response: getResponseHeaderStateList(pair),
                query: getRequestQueryStateList(pair),
            };
            const routeBody: SimulationHtmlState = {
                request:
                    pair.request.body?.map(bodyEl => ({
                        matcher: bodyEl.matcher || 'exact',
                        value: bodyEl.value || '',
                        type: (hightlightHtml(bodyEl.value || '').language || 'text') as MirrorBodyType,
                    })) || [],
                response: {
                    value: pair.response.body,
                    type: (hightlightHtml(pair.response.body).language || 'text') as MirrorBodyType,
                },
            };

            setCurrentPair(pair);
            setServerState(content);
            setHeaderQuery(headers);
            setBody(routeBody);
        }
    }, [routeIndex, state]);

    const renderDeleteButton = (onClick: () => void) => (
        <Button className={cn('remove-fields-btn')} actionType="button" sizeAll="small" onClick={onClick}>
            <Minus className={cn('remove-icon')} />
        </Button>
    );

    const renderField = useCallback(
        (onChangeField: (e: InputChange) => void, value: string, placeholder?: string) => (
            <TextField
                className={cn('field')}
                classes={{ input: cn('input') }}
                placeholder={placeholder}
                value={value || ''}
                onChange={onChangeField}
            />
        ),
        [],
    );

    const renderFieldList = (list: ServerState[], name: keyof SimulationsServerState) => (
        <div className={cn('field-list')}>
            {list.map((values, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <div className={cn('fields')} key={index}>
                    {renderField(handleChangeServerState(name, 'key', index), values.key || '', 'State key')}
                    {renderField(handleChangeServerState(name, 'value', index), values.value || '', 'State value')}
                    {renderDeleteButton(handleToggleServerState(name, index))}
                </div>
            ))}
        </div>
    );

    return (
        <div className={cn()}>
            <button className={cn('back-link')} type="button" onClick={onBack}>
                <ArrowIcon className={cn('arrow-icon')} />
                Back to Simulations
            </button>
            <div className={cn('wrapper')}>
                <div>
                    {useZeroMemo(
                        <Header className={cn('title')} as="h3">
                            {routeIndex === undefined ? 'New' : 'Update'} Simulation
                        </Header>,
                    )}
                    <div className={cn('action-button')}>
                        <Button
                            sizeAll="medium"
                            fullWidth
                            disabled={!currentPair?.request?.path?.[0]?.value}
                            onClick={handleSubmit}
                        >
                            {routeIndex === undefined ? 'Create' : 'Update'}
                        </Button>
                    </div>
                </div>
                <div className={cn('content')}>
                    <div className={cn('content-header-container')}>
                        <Header className={cn('content-header')} as="h5">
                            {routeIndex === undefined ? 'Create new' : 'Update'} simulation
                        </Header>
                    </div>
                    <div className={cn('content-body')}>
                        <CollapseWrapper isOpenDefault title="Stateful settings">
                            <div className={cn('collapse-content')}>
                                <SimulationFieldsBlock
                                    hasAddButton
                                    title="Require states"
                                    onAddButtonClick={handleToggleServerState('requiresState')}
                                >
                                    {!!requiresState.length && renderFieldList(requiresState, 'requiresState')}
                                </SimulationFieldsBlock>
                                <SimulationFieldsBlock
                                    hasAddButton
                                    title="New states"
                                    onAddButtonClick={handleToggleServerState('transitionsState')}
                                >
                                    {!!transitionsState.length && renderFieldList(transitionsState, 'transitionsState')}
                                </SimulationFieldsBlock>
                            </div>
                        </CollapseWrapper>
                        <CollapseWrapper isOpenDefault title="Request matchers">
                            <div className={cn('collapse-content')}>
                                <SimulationFieldsBlock title="Method">
                                    <div className={cn('fields')}>
                                        <Select
                                            classes={{ control: cn('select-contol') }}
                                            currentValue={currentPair?.request.method?.[0].value || 'GET'}
                                            items={METHODS}
                                            onSelect={handleChooseCurrentValueRequest('method', 'value')}
                                        />
                                    </div>
                                </SimulationFieldsBlock>
                                <SimulationFieldsBlock title="Destination">
                                    <div className={cn('fields')}>
                                        <Select
                                            classes={{ control: cn('select-contol') }}
                                            items={MATCHES}
                                            currentValue={
                                                currentPair?.request.destination?.[0].matcher || MATCHES[0].value
                                            }
                                            onSelect={handleChooseCurrentValueRequest('destination', 'matcher')}
                                        />
                                        {renderField(
                                            handleChangeCurrentRequest('destination', 'value'),
                                            currentPair?.request.destination?.[0].value || '',
                                            'localhost:8080',
                                        )}
                                    </div>
                                </SimulationFieldsBlock>
                                <SimulationFieldsBlock title="Path">
                                    <div className={cn('fields')}>
                                        <Select
                                            items={MATCHES}
                                            classes={{ control: cn('select-contol') }}
                                            currentValue={currentPair?.request.path?.[0].matcher || MATCHES[0].value}
                                            onSelect={handleChooseCurrentValueRequest('path', 'matcher')}
                                        />
                                        {renderField(
                                            handleChangeCurrentRequest('path', 'value'),
                                            currentPair?.request.path?.[0].value || '',
                                            'api/v1/match',
                                        )}
                                    </div>
                                </SimulationFieldsBlock>
                                <SimulationFieldsBlock
                                    hasAddButton
                                    title="Query"
                                    onAddButtonClick={handleToggleHeaderQuery('query')}
                                >
                                    {!!headerQuery.query.length && (
                                        <div className={cn('field-list')}>
                                            {headerQuery.query.map((header, index) => (
                                                // eslint-disable-next-line react/no-array-index-key
                                                <div className={cn('fields')} key={index}>
                                                    {renderField(
                                                        handleChangeHeaderQuery('query', 'key', index),
                                                        header.key,
                                                        'Query key',
                                                    )}
                                                    <Select
                                                        classes={{ control: cn('select-control') }}
                                                        items={MATCHES}
                                                        currentValue={header.match}
                                                        onSelect={handleChooseHeaderQuery('query', index)}
                                                    />
                                                    {renderField(
                                                        handleChangeHeaderQuery('query', 'value', index),
                                                        header.value,
                                                        'Query keys(s)',
                                                    )}
                                                    {renderDeleteButton(handleToggleHeaderQuery('query', index))}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </SimulationFieldsBlock>
                                <SimulationFieldsBlock
                                    hasAddButton
                                    title="Header"
                                    onAddButtonClick={handleToggleHeaderQuery('request')}
                                >
                                    {!!headerQuery.request.length && (
                                        <div className={cn('field-list')}>
                                            {headerQuery.request.map((header, index) => (
                                                // eslint-disable-next-line react/no-array-index-key
                                                <div className={cn('fields')} key={index}>
                                                    {renderField(
                                                        handleChangeHeaderQuery('request', 'key', index),
                                                        header.key,
                                                        'Header key',
                                                    )}
                                                    <Select
                                                        classes={{ control: cn('select-contol') }}
                                                        items={MATCHES}
                                                        currentValue={header.match}
                                                        onSelect={handleChooseHeaderQuery('request', index)}
                                                    />
                                                    {renderField(
                                                        handleChangeHeaderQuery('request', 'value', index),
                                                        header.value,
                                                        'Header keys(s)',
                                                    )}
                                                    {renderDeleteButton(handleToggleHeaderQuery('request', index))}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </SimulationFieldsBlock>
                                <SimulationFieldsBlock title="Body">
                                    {!!body.request.length && (
                                        <>
                                            {body.request.map((rBody, index) => (
                                                // eslint-disable-next-line react/no-array-index-key
                                                <div className={cn('fields')} key={index}>
                                                    <Select
                                                        classes={{ control: cn('select-contol') }}
                                                        items={MATCHES}
                                                        currentValue={rBody.matcher || MATCHES[0].value}
                                                        onSelect={handleChooseCurrentValueRequest('body', 'matcher')}
                                                    />
                                                    <Select
                                                        items={BODY_FORMATS}
                                                        currentValue={rBody.type}
                                                        onSelect={handleChooseBodyType('request')}
                                                    />
                                                    <CodeMirror
                                                        className={cn('editor')}
                                                        value={rBody.value}
                                                        options={getCodeMirrorConfig(rBody.type)}
                                                        onBeforeChange={handleChangeBody('request')}
                                                    />
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </SimulationFieldsBlock>
                            </div>
                        </CollapseWrapper>
                        <CollapseWrapper isOpenDefault title="Response">
                            <div className={cn('collapse-content')}>
                                <SimulationFieldsBlock title="Status code">
                                    <div className={cn('fields')}>
                                        <Select
                                            classes={{ control: cn('select-contol') }}
                                            items={STATUS_CODES}
                                            currentValue={currentPair?.response.status || STATUS_CODES[0].value}
                                            onSelect={handleChooseCurrentResponse('status')}
                                        />
                                    </div>
                                </SimulationFieldsBlock>
                                <SimulationFieldsBlock
                                    hasAddButton
                                    title="Header"
                                    onAddButtonClick={handleToggleHeaderQuery('response')}
                                >
                                    {!!headerQuery.response.length && (
                                        <div className={cn('field-list')}>
                                            {headerQuery.response.map((header, index) => (
                                                // eslint-disable-next-line react/no-array-index-key
                                                <div className={cn('fields')} key={index}>
                                                    {renderField(
                                                        handleChangeHeaderQuery('response', 'key', index),
                                                        header.key,
                                                        'Header key',
                                                    )}
                                                    {renderField(
                                                        handleChangeHeaderQuery('response', 'value', index),
                                                        header.value,
                                                        'Header value(s)',
                                                    )}
                                                    {renderDeleteButton(handleToggleHeaderQuery('response', index))}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </SimulationFieldsBlock>
                                <SimulationFieldsBlock title="Body">
                                    <div>
                                        <Select
                                            className={cn('select')}
                                            classes={{ control: cn('select-contol') }}
                                            items={BODY_FORMATS}
                                            currentValue={body.response.type || BODY_FORMATS[3].value}
                                            onSelect={handleChooseBodyType('response')}
                                        />
                                        <CodeMirror
                                            className={cn('editor')}
                                            value={body.response.value as string}
                                            options={getCodeMirrorConfig(body.response.type)}
                                            onBeforeChange={handleChangeBody('response')}
                                        />
                                    </div>
                                </SimulationFieldsBlock>
                                <div className={cn('checkboxes')}>
                                    <Checkbox
                                        checked={currentPair?.response.templated}
                                        onChange={handleChangeResponseCheckbox('templated')}
                                    >
                                        Enable templating
                                    </Checkbox>
                                    <Checkbox
                                        checked={currentPair?.response.encodedBody}
                                        onChange={handleChangeResponseCheckbox('encodedBody')}
                                    >
                                        Encoded body
                                    </Checkbox>
                                </div>
                            </div>
                        </CollapseWrapper>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Simulation;
