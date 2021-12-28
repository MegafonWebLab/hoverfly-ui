import React, { useMemo, useEffect, useCallback } from 'react';
import { Button, Checkbox, Header, Select, TextField } from '@megafon/ui-core';
import type { ISelectItem } from '@megafon/ui-core/dist/lib/components/Select/Select';
import { cnCreate } from '@megafon/ui-helpers';
import { ReactComponent as Minus } from '@megafon/ui-icons/system-16-minus_16.svg';
import { ReactComponent as Plus } from '@megafon/ui-icons/system-16-plus_16.svg';
import { Controlled as CodeMirror } from 'react-codemirror2';
import type { SimulationResponse, HoverflyMatcher, PairItemRequest, SimulationItem, PairItemResponse } from 'api/types';
import AccordionWrapper from 'components/AccordionWrapper/AccordionWrapper';
import './Simulations.pcss';
import { useDispatch, useSelector } from 'store/hooks';
import { createSimulationAsync, getSimulationAsync } from 'store/simulation/simulationSlice';
import { onlyDigits } from 'utils';
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
} from './constants';
import type {
    ServerState,
    SimulationsServerState,
    SimulationHeadersQueryState,
    SimulationHeaderState,
    SimulationHtmlState,
    BodyType,
} from './types';
import {
    addOrRemoveEl,
    changeCurrentPairRequest,
    changeCurrentPairResponse,
    changeHeaderState,
    changeServerState,
    getCodeMirrorConfig,
    getDelay,
    getRemoveStateList,
    getRequestHeadersStateList,
    getRequestQueryStateList,
    getRequireStateList,
    getResponseHeaderStateList,
    getRouteList,
    getTransitionStateList,
    hightlightHtml,
    mergeBodyStateToCurrentPair,
    mergeCurrentStateToMainState,
    mergeDelayToMainState,
    mergeHeaderStateToCurrentPair,
    mergeServerStateToCurrentPair,
} from './utils';

import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';

require('codemirror/mode/xml/xml');
require('codemirror/mode/javascript/javascript');
require('codemirror/mode/htmlmixed/htmlmixed');

type InputChange = React.ChangeEvent<HTMLInputElement>;
type ChangeCurrentNames = keyof Omit<PairItemRequest, 'headers' | 'query' | 'requiresState'>;

const useZeroMemo = (el: JSX.Element) => useMemo(() => el, []);

const cn = cnCreate('simulations');
const Simulations: React.FC = () => {
    const dispatch = useDispatch();
    const statusState = !!useSelector(state => state.status.value);
    const simulationStore = useSelector(state => state.simulation);

    const [routeIndex, setRouteIndex] = React.useState<number | undefined>(undefined);
    const [state, setState] = React.useState<SimulationResponse>(initialState);
    const [serverState, setServerState] = React.useState<SimulationsServerState>(initialServerState);
    const [currentPair, setCurrentPair] = React.useState<SimulationItem | undefined>(undefined);
    const [headerQuery, setHeaderQuery] = React.useState<SimulationHeadersQueryState>(initialHeaderQuery);
    const [body, setBody] = React.useState<SimulationHtmlState>(initialBodyState);

    const routes = state ? getRouteList(state.data.pairs) : [];
    const selectRoutes = routes.map<ISelectItem<number>>((r, index) => ({ title: r, value: index }));
    const delay = getDelay(state);
    const isRouteIndex = routeIndex !== undefined;

    function handleChangeDelay(e: React.ChangeEvent<HTMLInputElement>) {
        setState(prev => mergeDelayToMainState(prev, parseInt(onlyDigits(e.target.value) || '0', 10)));
    }

    function handleChooseRoute(_e: React.MouseEvent<HTMLDivElement>, dataItem?: ISelectItem<number>) {
        if (isRouteIndex && currentPair) {
            const pair = mergeServerStateToCurrentPair(
                mergeHeaderStateToCurrentPair(mergeBodyStateToCurrentPair(currentPair, body), headerQuery),
                serverState,
            );
            setState(mergeCurrentStateToMainState(state, pair, routeIndex));
        }

        setRouteIndex(dataItem?.value);

        if (dataItem?.value !== undefined) {
            setCurrentPair(state.data.pairs[dataItem.value]);
        }
    }

    function handleSaveState() {
        if (state) {
            const pair = currentPair
                ? mergeServerStateToCurrentPair(
                      mergeHeaderStateToCurrentPair(mergeBodyStateToCurrentPair(currentPair, body), headerQuery),
                      serverState,
                  )
                : null;
            const newState = isRouteIndex && pair ? mergeCurrentStateToMainState(state, pair, routeIndex) : state;
            dispatch(createSimulationAsync(newState));
        }
    }

    function handleExportJson() {
        const content = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(state))}`;
        const linkEl = document.createElement('a');
        linkEl.setAttribute('href', content);
        linkEl.setAttribute('download', 'simulations.json');
        linkEl.click();
        linkEl.remove();
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

    function handleToogleHeaderQuery(key: keyof SimulationHeadersQueryState, index?: number) {
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

    function handleChangeCurrentDelay(e: InputChange) {
        setCurrentPair(prev =>
            changeCurrentPairResponse(prev, 'fixedDelay', parseInt(onlyDigits(e.target.value) || '0', 10)),
        );
    }

    function handleChooseCurrentResponse(name: keyof PairItemResponse) {
        return (_e: React.MouseEvent<HTMLDivElement>, dataItem?: ISelectItem<number>) => {
            setCurrentPair(prev => changeCurrentPairResponse(prev, name, dataItem?.value || 0));
        };
    }

    function handleChangeResponseCheckbox(name: keyof Pick<PairItemResponse, 'encodedBody' | 'templated'>) {
        return () => {
            setCurrentPair(prev => changeCurrentPairResponse(prev, name, !prev?.response[name]));
        };
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

    function handleToggleRequstBody(isRemove?: true) {
        return () => {
            setBody(prev => ({ ...prev, request: isRemove ? [] : [{ matcher: 'exact', type: 'text', value: '' }] }));
        };
    }

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

    const renderStateFields = (values: ServerState, name: keyof SimulationsServerState, index: number) => (
        <div className={cn('fields')} key={index}>
            <TextField
                className={cn('field')}
                placeholder="State key"
                value={values.key || ''}
                onChange={handleChangeServerState(name, 'key', index)}
            />
            <TextField
                className={cn('field')}
                placeholder="State value"
                value={values.value || ''}
                onChange={handleChangeServerState(name, 'value', index)}
            />
            <Button
                className={cn('field-add')}
                actionType="button"
                sizeAll="small"
                icon={<Minus />}
                onClick={handleToggleServerState(name, index)}
                disabled={!isRouteIndex}
            />
        </div>
    );

    const renderButton = useCallback(
        (cb: () => void, isNegative?: boolean) => (
            <Button
                className={cn('field-add')}
                actionType="button"
                sizeAll="small"
                icon={!isNegative ? <Plus /> : <Minus />}
                onClick={cb}
                disabled={!isRouteIndex}
            />
        ),
        [isRouteIndex],
    );

    const renderField = useCallback(
        (onChange: (e: InputChange) => void, value: string, placeholder?: string) => (
            <TextField
                className={cn('field')}
                disabled={!isRouteIndex}
                placeholder={placeholder}
                value={value || ''}
                onChange={onChange}
            />
        ),
        [isRouteIndex],
    );

    return (
        <div className={cn()}>
            {useZeroMemo(
                <Header className={cn('title')} as="h3">
                    Simulations
                </Header>,
            )}
            <div className={cn('header')}>
                <div className={cn('header-left')}>
                    <div className={cn('field-wrapper')}>
                        <TextField
                            label="Global delay"
                            value={delay || ''}
                            inputMode="numeric"
                            type="tel"
                            onChange={handleChangeDelay}
                            isControlled
                        />
                    </div>
                    <div className={cn('field-wrapper')}>
                        <Select
                            classes={{ root: cn('routes') }}
                            label="Route"
                            currentValue={routeIndex}
                            items={selectRoutes}
                            onSelect={handleChooseRoute}
                        />
                    </div>
                </div>
                <div className={cn('header-right')}>
                    <Button className={cn('header-button')} actionType="button" onClick={handleSaveState}>
                        Save
                    </Button>
                    <Button actionType="button" onClick={handleExportJson}>
                        Export All
                    </Button>
                </div>
            </div>
            <div className={cn('content')}>
                <AccordionWrapper isOpenDefault title="Stateful settings">
                    <div className={cn('field-line')}>
                        <div className={cn('field-name')}>Require states</div>
                        <div>
                            {renderButton(handleToggleServerState('requiresState'))}
                            {serverState.requiresState.length > 0 &&
                                serverState.requiresState.map((values, index) =>
                                    renderStateFields(values, 'requiresState', index),
                                )}
                        </div>
                    </div>
                    <div className={cn('field-line')}>
                        <div className={cn('field-name')}>New states</div>
                        <div>
                            {renderButton(handleToggleServerState('transitionsState'))}
                            {serverState.transitionsState.length > 0 &&
                                serverState.transitionsState.map((values, index) =>
                                    renderStateFields(values, 'transitionsState', index),
                                )}
                        </div>
                    </div>
                </AccordionWrapper>
                <AccordionWrapper isOpenDefault title="Request matchers">
                    <div className={cn('field-line')}>
                        <div className={cn('field-name')}>Method</div>
                        <Select
                            className={cn('select')}
                            currentValue={currentPair?.request.method?.[0].value || 'GET'}
                            items={METHODS}
                            disabled={!isRouteIndex}
                            onSelect={handleChooseCurrentValueRequest('method', 'value')}
                        />
                    </div>
                    <div className={cn('field-line')}>
                        <div className={cn('field-name')}>Destination</div>
                        <div className={cn('fields')}>
                            <Select
                                className={cn('select')}
                                items={MATCHES}
                                disabled={!isRouteIndex}
                                currentValue={currentPair?.request.destination?.[0].matcher || ''}
                                onSelect={handleChooseCurrentValueRequest('destination', 'matcher')}
                            />
                            {renderField(
                                handleChangeCurrentRequest('destination', 'value'),
                                currentPair?.request.destination?.[0].value || '',
                            )}
                        </div>
                    </div>
                    <div className={cn('field-line')}>
                        <div className={cn('field-name')}>Path</div>
                        <div className={cn('fields')}>
                            <Select
                                className={cn('select')}
                                items={MATCHES}
                                disabled={!isRouteIndex}
                                currentValue={currentPair?.request.path?.[0].matcher || ''}
                                onSelect={handleChooseCurrentValueRequest('path', 'matcher')}
                            />
                            {renderField(
                                handleChangeCurrentRequest('path', 'value'),
                                currentPair?.request.path?.[0].value || '',
                            )}
                        </div>
                    </div>
                    <div className={cn('field-line')}>
                        <div className={cn('field-name')}>Query</div>
                        <div>
                            {renderButton(handleToogleHeaderQuery('query'))}
                            {headerQuery.query.map((header, index) => (
                                // eslint-disable-next-line react/no-array-index-key
                                <div className={cn('fields')} key={index}>
                                    {renderField(
                                        handleChangeHeaderQuery('query', 'key', index),
                                        header.key,
                                        'Query key',
                                    )}
                                    <Select
                                        className={cn('select')}
                                        items={MATCHES}
                                        disabled={!isRouteIndex}
                                        currentValue={header.match}
                                        onSelect={handleChooseHeaderQuery('query', index)}
                                    />
                                    {renderField(
                                        handleChangeHeaderQuery('query', 'value', index),
                                        header.value,
                                        'Query value(s)',
                                    )}
                                    {renderButton(handleToogleHeaderQuery('query', index), true)}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className={cn('field-line')}>
                        <div className={cn('field-name')}>Header</div>
                        <div>
                            {renderButton(handleToogleHeaderQuery('request'))}
                            {headerQuery.request.map((header, index) => (
                                // eslint-disable-next-line react/no-array-index-key
                                <div className={cn('fields')} key={index}>
                                    {renderField(
                                        handleChangeHeaderQuery('request', 'key', index),
                                        header.key,
                                        'Header key',
                                    )}
                                    <Select
                                        className={cn('select')}
                                        items={MATCHES}
                                        disabled={!isRouteIndex}
                                        currentValue={header.match}
                                        onSelect={handleChooseHeaderQuery('request', index)}
                                    />
                                    {renderField(
                                        handleChangeHeaderQuery('request', 'value', index),
                                        header.value,
                                        'Header value(s)',
                                    )}
                                    {renderButton(handleToogleHeaderQuery('request', index), true)}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className={cn('field-line')}>
                        <div className={cn('field-name')}>Body</div>
                        <div>
                            {body.request.length === 0
                                ? renderButton(handleToggleRequstBody())
                                : renderButton(handleToggleRequstBody(true), true)}
                            {body.request.map(rBody => (
                                <>
                                    <Select
                                        className={cn('select', { line: true })}
                                        items={MATCHES}
                                        disabled={!isRouteIndex}
                                        currentValue={rBody.matcher || ''}
                                        onSelect={handleChooseCurrentValueRequest('body', 'matcher')}
                                    />
                                    <Select
                                        className={cn('select', { line: true })}
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
                                </>
                            ))}
                        </div>
                    </div>
                </AccordionWrapper>
                <AccordionWrapper isOpenDefault title="Response">
                    <div className={cn('field-line')}>
                        <div className={cn('field-name')}>Status code</div>
                        <Select
                            className={cn('select')}
                            items={STATUS_CODES}
                            disabled={!isRouteIndex}
                            currentValue={currentPair?.response.status}
                            onSelect={handleChooseCurrentResponse('status')}
                        />
                    </div>
                    <div className={cn('field-line')}>
                        <div className={cn('field-name')}>Fixed delay</div>
                        <TextField
                            value={currentPair?.response.fixedDelay || ''}
                            inputMode="numeric"
                            type="tel"
                            onChange={handleChangeCurrentDelay}
                            isControlled
                            disabled={!isRouteIndex}
                        />
                    </div>
                    <div className={cn('field-line')}>
                        <div className={cn('field-name')}>Header</div>
                        <div>
                            {renderButton(handleToogleHeaderQuery('response'))}
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
                                        items={MATCHES}
                                        disabled={!isRouteIndex}
                                        currentValue={header.match}
                                        onSelect={handleChooseHeaderQuery('response', index)}
                                    />
                                    {renderField(
                                        handleChangeHeaderQuery('response', 'value', index),
                                        header.value,
                                        'Header value(s)',
                                    )}
                                    {renderButton(handleToogleHeaderQuery('response', index), true)}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className={cn('field-line')}>
                        <div className={cn('field-name')}>Body</div>
                        <div>
                            <Select
                                className={cn('select', { line: true })}
                                items={BODY_FORMATS}
                                disabled={!isRouteIndex}
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
                    </div>
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
                </AccordionWrapper>
            </div>
        </div>
    );
};
export default Simulations;
