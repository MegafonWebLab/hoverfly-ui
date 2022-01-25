import React, { useMemo, useEffect, useCallback, useState } from 'react';
import { Button, Checkbox, Header, Select, TextField } from '@megafon/ui-core';
import { ReactComponent as DeleteIcon } from '@megafon/ui-icons/basic-16-delete_16.svg';
import type { ISelectItem } from '@megafon/ui-core/dist/lib/components/Select/Select';
import { cnCreate } from '@megafon/ui-helpers';
import { ReactComponent as Minus } from '@megafon/ui-icons/system-16-minus_16.svg';
import { Controlled as CodeMirror } from 'react-codemirror2';
import type { SimulationResponse, HoverflyMatcher, PairItemRequest, SimulationItem, PairItemResponse } from 'api/types';
import CollapseWrapper from 'components/CollapseWrapper/CollapseWrapper';
import './NewSimulation.pcss';
import { useDispatch, useSelector } from 'store/hooks';
import { getSimulationAsync } from 'store/simulation/simulationSlice';
import {
    BODY_FORMATS,
    headerEmpty,
    initialBodyState,
    initialHeaderQuery,
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
    BodyType,
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
    hightlightHtml,
} from '../utils';

import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import NewSimulationFieldsBlock from './NewSimulationFieldsBlock/NewSimulationFieldsBlock';

require('codemirror/mode/xml/xml');
require('codemirror/mode/javascript/javascript');
require('codemirror/mode/htmlmixed/htmlmixed');

type InputChange = React.ChangeEvent<HTMLInputElement>;
type ChangeCurrentNames = keyof Omit<PairItemRequest, 'headers' | 'query' | 'requiresState'>;

const useZeroMemo = (el: JSX.Element) => useMemo(() => el, []);

const cn = cnCreate('new-simulations');
const NewSimulation: React.FC = () => {
    const dispatch = useDispatch();
    const statusState = !!useSelector(state => state.status.value);
    const simulationStore = useSelector(state => state.simulation);

    const [routeIndex] = useState<number | undefined>(undefined);
    const [state, setState] = useState<SimulationResponse>(initialState);
    const [serverState, setServerState] = useState<SimulationsServerState>(initialServerState);
    const [currentPair, setCurrentPair] = useState<SimulationItem | undefined>(undefined);
    const [headerQuery, setHeaderQuery] = useState<SimulationHeadersQueryState>(initialHeaderQuery);
    const [body, setBody] = useState<SimulationHtmlState>(initialBodyState);

    const [showDestination, setShowDestination] = useState(true);
    const [showPath, setShowPath] = useState(true);

    const { transitionsState, requiresState } = serverState;

    const isRouteIndex = routeIndex !== undefined;

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

    function handleToogleHeaderQuery(key: keyof SimulationHeadersQueryState, index?: number) {
        return () =>
            setHeaderQuery(prev => ({
                ...prev,
                [key]: addOrRemoveEl(prev[key], { add: headerEmpty, remove: index }),
            }));
    }

    function handleClearButtonClick() {
        setServerState(initialServerState);
        setCurrentPair(undefined);
        setHeaderQuery(initialHeaderQuery);
    };

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
        return (_e: React.MouseEvent<HTMLDivElement>, dataItem?: ISelectItem<BodyType>) => {
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

    // function handleToggleRequstBody(isRemove?: true) {
    //     return () => {
    //         setBody(prev => ({ ...prev, request: isRemove ? [] : [{ matcher: 'exact', type: 'text', value: '' }] }));
    //     };
    // }

    useEffect(() => {
        statusState && dispatch(getSimulationAsync());
    }, [statusState]);

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
                        type: (hightlightHtml(bodyEl.value || '').language || 'text') as BodyType,
                    })) || [],
                response: {
                    value: pair.response.body,
                    type: (hightlightHtml(pair.response.body).language || 'text') as BodyType,
                },
            };
            
            setServerState(content);
            setHeaderQuery(headers);
            setBody(routeBody);
        }
    }, [routeIndex, state]);

    const renderDeleteButton = (onClick: () => void) => (
        <Button
            className={cn('remove-fields-btn')}
            actionType="button"
            sizeAll="small"
            onClick={onClick}
        >
            <Minus className={cn('remove-icon')}/>
        </Button>
    )

    const renderField = useCallback(
        (onChange: (e: InputChange) => void, value: string, placeholder?: string) => (
            <TextField
                className={cn('field')}
                classes={{ input: cn('input') }}
                // disabled={!isRouteIndex}
                placeholder={placeholder}
                value={value || ''}
                onChange={onChange}
            />
        ),
        [isRouteIndex],
    );

    const renderFieldList = (list: ServerState[], name: keyof SimulationsServerState) => (
            <div className={cn('field-list')}>
                {list.map((values, index) =>
                    <div className={cn('fields')} key={index}>
                        {console.log(values,index)}
                        {renderField(
                            handleChangeServerState(name, 'key', index),
                            values.key || '',
                            "State key"
                        )}
                        {renderField(
                            handleChangeServerState(name, 'value', index),
                            values.value || '',
                            "State value"
                        )}
                        {/* {renderDeleteButton(handleToggleServerState(name, index))} */}
                    </div>
                )}
            </div>
    );

    return (
        <div className={cn()}>
            {useZeroMemo(
                <Header className={cn('title')} as="h3">
                    New Simulation
                </Header>
            )}
            <div className={cn('content')}>
                    <div className={cn('content-header-container')}>
                        <Header className={cn('content-header')} as='h5'>
                            Create new simulation
                        </Header>
                        <button
                            type="button"
                            className={cn('delete-btn')}
                            onClick={handleClearButtonClick}
                        >
                            <DeleteIcon />
                        </button>
                    </div>
                    <div className={cn('content-body')}>
                    <CollapseWrapper isOpenDefault title="Stateful settings">
                        <div className={cn('collapse-content')}>
                            <NewSimulationFieldsBlock
                                hasAddButton
                                title='Require states'
                                onAddButtonClick={handleToggleServerState('requiresState')}
                            >
                                {!!requiresState.length && renderFieldList(requiresState, 'requiresState')}
                            </NewSimulationFieldsBlock>
                            <NewSimulationFieldsBlock
                                hasAddButton
                                title='New states'
                                onAddButtonClick={handleToggleServerState('transitionsState')}
                            >
                                {!!transitionsState.length && renderFieldList(transitionsState, 'transitionsState')}
                            </NewSimulationFieldsBlock>
                        </div>
                    </CollapseWrapper>
                    <CollapseWrapper isOpenDefault title="Request matchers">
                        <div className={cn('collapse-content')}>
                            <NewSimulationFieldsBlock title='Method'>
                                <div className={cn('fields')}>
                                    <Select
                                        classes={{ control: cn('select-contol') }}
                                        currentValue={currentPair?.request.method?.[0].value || 'GET'}
                                        items={METHODS}
                                        // disabled={!isRouteIndex}
                                        onSelect={handleChooseCurrentValueRequest('method', 'value')}
                                    />
                                </div>
                            </NewSimulationFieldsBlock>
                            <NewSimulationFieldsBlock
                                title='Destination'
                                onAddButtonClick={() => setShowDestination(true)}
                            >
                                {showDestination && (
                                    <div className={cn('fields')}>
                                        <Select
                                            classes={{ control: cn('select-contol') }}
                                            items={MATCHES}
                                            // disabled={!isRouteIndex}
                                            currentValue={currentPair?.request.destination?.[0].matcher || MATCHES[0].value}
                                            onSelect={handleChooseCurrentValueRequest('destination', 'matcher')}
                                        />
                                        {renderField(
                                            handleChangeCurrentRequest('destination', 'value'),
                                            currentPair?.request.destination?.[0].value || '',
                                            'localhost:8080'
                                        )}
                                        {renderDeleteButton(() => setShowDestination(false))}
                                    </div>
                                )
                            }
                            </NewSimulationFieldsBlock>
                            <NewSimulationFieldsBlock
                                title='Path'
                                onAddButtonClick={() => setShowPath(true)}
                            >
                                {showPath && (
                                    <div className={cn('fields')}>
                                        <Select
                                            items={MATCHES}
                                            // disabled={!isRouteIndex}
                                            classes={{ control: cn('select-contol') }}
                                            currentValue={currentPair?.request.path?.[0].matcher || MATCHES[0].value}
                                            onSelect={handleChooseCurrentValueRequest('path', 'matcher')}
                                        />
                                        {renderField(
                                            handleChangeCurrentRequest('path', 'value'),
                                            currentPair?.request.path?.[0].value || '',
                                            'api/v1/match'
                                        )}
                                        {renderDeleteButton(() => setShowPath(false))}
                                    </div>
                                )}
                            </NewSimulationFieldsBlock>
                            <NewSimulationFieldsBlock
                                hasAddButton
                                title='Query'
                                onAddButtonClick={handleToogleHeaderQuery('query')}
                            >
                                {!!headerQuery.query.length && (
                                    <div className={cn('field-list')}>
                                        {headerQuery.query.map((header, index) => (
                                            // eslint-disable-next-line react/no-array-index-key
                                            <div className={cn('fields')} key={index}>
                                                {renderField(
                                                    handleChangeHeaderQuery('query', 'key', index),
                                                        header.key, 'Query key')}
                                                        <Select
                                                            classes={{ control: cn('select-contol') }}
                                                            items={MATCHES}
                                                            // disabled={!isRouteIndex}
                                                            currentValue={header.match}
                                                            onSelect={handleChooseHeaderQuery('query', index)}
                                                        />
                                                {renderField(
                                                    handleChangeHeaderQuery('query', 'value', index),
                                                    header.value,
                                                    'Query keys(s)',
                                                )}
                                                {renderDeleteButton(handleToogleHeaderQuery('query', index))}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                            </NewSimulationFieldsBlock>
                            <NewSimulationFieldsBlock
                                hasAddButton
                                title='Header'
                                onAddButtonClick={handleToogleHeaderQuery('request')}
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
                                                    // disabled={!isRouteIndex}
                                                    currentValue={header.match}
                                                    onSelect={handleChooseHeaderQuery('request', index)}
                                                />
                                                {renderField(
                                                    handleChangeHeaderQuery('request', 'value', index),
                                                    header.value,
                                                    'Header keys(s)',
                                                )}
                                                {renderDeleteButton(handleToogleHeaderQuery('request', index))}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                            </NewSimulationFieldsBlock>
                            <NewSimulationFieldsBlock
                                title='Body'
                                onAddButtonClick={() => handleChangeBody('request')}
                            >
                                {!!body.request.length && (
                                    <>
                                        {body.request.map((rBody, index) => (
                                            <div className={cn('fields')} key={index}>
                                                <Select
                                                    classes={{ control: cn('select-contol') }}
                                                    items={MATCHES}
                                                    disabled={!isRouteIndex}
                                                    currentValue={rBody.matcher || MATCHES[0].value}
                                                    onSelect={handleChooseCurrentValueRequest('body', 'matcher')}
                                                />
                                                <Select
                                                    disabled={!isRouteIndex}
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
                                
                            </NewSimulationFieldsBlock>
                        </div>
                    </CollapseWrapper>
                    <CollapseWrapper isOpenDefault title="Response">
                        <div className={cn('collapse-content')}>
                            <NewSimulationFieldsBlock
                                title='Status code'
                            >
                                <div className={cn('fields')}>
                                    <Select
                                        classes={{ control: cn('select-contol') }}
                                        items={STATUS_CODES}
                                        // disabled={!isRouteIndex}
                                        currentValue={currentPair?.response.status}
                                        onSelect={handleChooseCurrentResponse('status')}
                                    />
                                </div>
                                
                            </NewSimulationFieldsBlock>
                            <NewSimulationFieldsBlock
                                title='Header'
                                onAddButtonClick={handleToogleHeaderQuery('response')}
                            >
                                {!!headerQuery.response.length && (
                                    <>
                                        {headerQuery.response.map((header, index) => (
                                            // eslint-disable-next-line react/no-array-index-key
                                            <div className={cn('fields')} key={index}>
                                                {renderField(
                                                    handleChangeHeaderQuery('response', 'key', index),
                                                    header.key,
                                                    'Header key',
                                                )}
                                                <Select
                                                    className={cn('select')}
                                                    classes={{ control: cn('select-contol') }}
                                                    items={MATCHES}
                                                    // disabled={!isRouteIndex}
                                                    currentValue={header.match}
                                                    onSelect={handleChooseHeaderQuery('response', index)}
                                                />
                                                {renderField(
                                                    handleChangeHeaderQuery('response', 'value', index),
                                                    header.value,
                                                    'Header value(s)',
                                                )}
                                                {renderDeleteButton(handleToogleHeaderQuery('response', index))}
                                            </div>
                                        ))}
                                    </>
                                )}
                            </NewSimulationFieldsBlock>
                            <NewSimulationFieldsBlock
                                title='Body'
                            >
                                <div>
                                    <Select
                                        className={cn('select')}
                                        classes={{ control: cn('select-contol') }}
                                        items={BODY_FORMATS}
                                        // disabled={!isRouteIndex}
                                        currentValue={body.response.type}
                                        onSelect={handleChooseBodyType('response')}
                                    />
                                    <CodeMirror
                                        className={cn('editor')}
                                        value={body.response.value as string}
                                        options={getCodeMirrorConfig(body.response.type)}
                                        onBeforeChange={handleChangeBody('response')}
                                />
                                </div>
                            </NewSimulationFieldsBlock>
                            <div className={cn('checkboxes')}> 
                                <Checkbox
                                    disabled={!isRouteIndex}
                                    fontSize="small"
                                    checked={currentPair?.response.templated}
                                    onChange={handleChangeResponseCheckbox('templated')}
                                >
                                    Enable templating
                                </Checkbox>
                                <Checkbox
                                    disabled={!isRouteIndex}
                                    fontSize="small"
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
    );
};
export default NewSimulation;
