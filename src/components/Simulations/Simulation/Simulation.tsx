/* eslint-disable react/jsx-props-no-spreading */
import React, { useMemo, useEffect, useCallback, useState } from 'react';
import { Button, Checkbox, Header, Select, TextField } from '@megafon/ui-core';
import type { ISelectItem } from '@megafon/ui-core/dist/lib/components/Select/Select';
import type { TextFieldProps } from '@megafon/ui-core/dist/lib/components/TextField/TextField';
import { cnCreate } from '@megafon/ui-helpers';
import { ReactComponent as ArrowIcon } from '@megafon/ui-icons/system-16-arrow_left_16.svg';
import { ReactComponent as Minus } from '@megafon/ui-icons/system-16-minus_16.svg';
import { Controlled as CodeMirror } from 'react-codemirror2';
import { useParams } from 'react-router-dom';
import type { SimulationResponse, HoverflyMatcher, PairItemRequest, SimulationItem, PairItemResponse } from 'api/types';
import CollapseWrapper from 'components/CollapseWrapper/CollapseWrapper';
import './Simulation.pcss';
import { useSelector } from 'store/hooks';
import { convertStringToInteger, hightlightHtml, MirrorBodyType } from 'utils';
import {
    BODY_FORMATS,
    FIELDS_ERROR,
    headerEmpty,
    initialBodyState,
    initialFieldsError,
    initialHeaderQuery,
    initialPairState,
    initialServerState,
    initialState,
    MATCHES,
    METHODS,
    serverStateEmpty,
} from '../constants';
import type {
    ServerState,
    SimulationsServerState,
    SimulationHeadersQueryState,
    SimulationHeaderState,
    SimulationHtmlState,
    SimulationFieldsErrorState,
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
    getVerificationFields,
    isFieldsError,
    mergeBodyStateToCurrentPair,
    mergeCurrentStateToMainState,
    mergeHeaderStateToCurrentPair,
    mergeMatcherValueToCurrentPair,
    mergeServerStateToCurrentPair,
} from '../utils';

import 'codemirror/lib/codemirror.css';
import SimulationFieldsBlock from './SimulationFieldsBlock/SimulationFieldsBlock';

require('codemirror/mode/xml/xml');
require('codemirror/mode/javascript/javascript');
require('codemirror/mode/htmlmixed/htmlmixed');

type InputChange = React.ChangeEvent<HTMLInputElement>;
type InputFocus = React.FocusEvent<HTMLInputElement>;
type InputPropsType = {
    placeholder?: string;
    name?: string;
    inputMask?: string;
    inputMode?: TextFieldProps['inputMode'];
    onBlurField?: (e: InputFocus) => void;
};
type ChangeCurrentNames = keyof Omit<PairItemRequest, 'headers' | 'query' | 'requiresState'>;

// eslint-disable-next-line react-hooks/exhaustive-deps
const useZeroMemo = (el: JSX.Element) => useMemo(() => el, []);

interface ISimulationProps {
    onDelete: (index: number) => void;
    onChange: (state: SimulationResponse) => void;
    onBack: () => void;
}

const cn = cnCreate('simulation');
const Simulation: React.FC<ISimulationProps> = ({ onBack, onChange, onDelete }) => {
    const { routeIndex: paramIndex } = useParams<{ routeIndex?: string }>();
    const routeIndex = paramIndex !== undefined ? Number(paramIndex) : undefined;
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
    const [fieldsError, setFieldsError] = useState<SimulationFieldsErrorState>(initialFieldsError);

    const method = currentPair?.request.method?.[0].value || 'GET';
    const { transitionsState, requiresState } = serverState;

    const isAnyFieldError: boolean = useMemo(() => !!Object.values(fieldsError).find(error => !!error), [fieldsError]);
    const isDisabledButton: boolean =
        !currentPair?.request?.path?.[0]?.value || !currentPair?.response?.status || isAnyFieldError;

    function handleSubmit() {
        if (state && simulationStore.type !== 'pending') {
            const pair = currentPair
                ? mergeServerStateToCurrentPair(
                      mergeHeaderStateToCurrentPair(
                          mergeBodyStateToCurrentPair(mergeMatcherValueToCurrentPair(currentPair), body),
                          headerQuery,
                      ),
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

    function handleChangeCurrentResponse(name: keyof PairItemResponse, isValueNumber?: boolean) {
        return (e: InputChange) => {
            const currentValue: string | number = isValueNumber
                ? convertStringToInteger(e.target.value) || ''
                : e.target.value;

            setCurrentPair(prev => changeCurrentPairResponse(prev, name, currentValue));
        };
    }

    function handleBlurCurrentResponse(errorName: keyof SimulationFieldsErrorState) {
        return (e: InputFocus) => {
            const isFieldError: boolean = isFieldsError(errorName, e.target.value);

            if (isFieldError) {
                setFieldsError(prev => ({ ...prev, [errorName]: FIELDS_ERROR[errorName] }));

                return;
            }

            setFieldsError(prev => ({ ...prev, [errorName]: '' }));
        };
    }

    function handleChangeResponseCheckbox(name: keyof Pick<PairItemResponse, 'encodedBody' | 'templated'>) {
        return () => setCurrentPair(prev => changeCurrentPairResponse(prev, name, !prev?.response[name]));
    }

    function handleChooseBodyType(key: keyof SimulationHtmlState, name: 'type' | 'matcher') {
        return (_e: React.MouseEvent<HTMLDivElement>, dataItem?: ISelectItem<MirrorBodyType>) => {
            setBody(prev => ({ ...prev, [key]: { ...prev[key], [name]: dataItem?.value } }));
        };
    }

    function handleChangeBody(key: keyof SimulationHtmlState) {
        return (_editor: unknown, _data: unknown, value: string) => {
            setBody(prev => ({ ...prev, [key]: { ...prev[key], value } }));
        };
    }

    function handleDelete(_e: React.MouseEvent<HTMLButtonElement>) {
        paramIndex && onDelete(Number(paramIndex));
    }

    useEffect(() => {
        simulationStore.type === 'success' && setState(simulationStore.value);
    }, [simulationStore]);

    useEffect(() => {
        if (routeIndex !== undefined && state && state.data.pairs.length > 0) {
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
                request: {
                    matcher: pair.request.body?.[0]?.matcher || 'exact',
                    value: pair.request.body?.[0]?.value || '',
                    type: (hightlightHtml(pair.request.body?.[0]?.value || '').language || 'text') as MirrorBodyType,
                },
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
        (
            onChangeField: (e: InputChange) => void,
            value: string,
            { placeholder, name, inputMask, inputMode, onBlurField }: InputPropsType,
        ) => (
            <TextField
                className={cn('field')}
                classes={{ input: cn('input') }}
                placeholder={placeholder}
                value={value || ''}
                mask={inputMask}
                inputMode={inputMode}
                onChange={onChangeField}
                onBlur={onBlurField}
                {...getVerificationFields(fieldsError[name || ''])}
            />
        ),
        [fieldsError],
    );

    const renderFieldList = (list: ServerState[], name: keyof SimulationsServerState) => (
        <div className={cn('field-list')}>
            {list.map((values, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <div className={cn('fields')} key={index}>
                    {renderField(handleChangeServerState(name, 'key', index), values.key || '', {
                        placeholder: 'State key',
                    })}
                    {renderField(handleChangeServerState(name, 'value', index), values.value || '', {
                        placeholder: 'State value',
                    })}
                    {renderDeleteButton(handleToggleServerState(name, index))}
                </div>
            ))}
        </div>
    );

    return (
        <div className={cn()}>
            <div className={cn('wrapper')}>
                <div className={cn('left')}>
                    <button className={cn('back-link')} type="button" onClick={onBack}>
                        <ArrowIcon className={cn('arrow-icon')} />
                        Back to Simulations
                    </button>
                    {useZeroMemo(
                        <Header className={cn('title')} as="h3">
                            {routeIndex === undefined ? 'New' : 'Update'} Simulation
                        </Header>,
                    )}
                    <div className={cn('action-button')}>
                        <Button sizeAll="medium" fullWidth disabled={isDisabledButton} onClick={handleSubmit}>
                            {routeIndex === undefined ? 'Create' : 'Update'}
                        </Button>
                        {routeIndex !== undefined && (
                            <Button className={cn('delete')} type="outline" onClick={handleDelete}>
                                Delete
                            </Button>
                        )}
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
                                    title="Require state"
                                    onAddButtonClick={handleToggleServerState('requiresState')}
                                >
                                    {!!requiresState.length && renderFieldList(requiresState, 'requiresState')}
                                </SimulationFieldsBlock>
                                <SimulationFieldsBlock
                                    hasAddButton
                                    title="New state"
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
                                            currentValue={method}
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
                                            { placeholder: 'localhost:8080' },
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
                                            { placeholder: 'api/v1/match' },
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
                                                        { placeholder: 'Query key' },
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
                                                        { placeholder: 'Query keys(s)' },
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
                                                        { placeholder: 'Header key' },
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
                                                        { placeholder: 'Header keys(s)' },
                                                    )}
                                                    {renderDeleteButton(handleToggleHeaderQuery('request', index))}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </SimulationFieldsBlock>
                                {method !== 'GET' && (
                                    <SimulationFieldsBlock title="Body">
                                        <div>
                                            <Select
                                                classes={{ control: cn('select-contol'), root: cn('select-root') }}
                                                items={MATCHES}
                                                currentValue={body.request?.matcher || MATCHES[0].value}
                                                onSelect={handleChooseBodyType('request', 'matcher')}
                                            />
                                            <Select
                                                classes={{ control: cn('select-contol'), root: cn('select-root') }}
                                                items={BODY_FORMATS}
                                                currentValue={body.request?.type}
                                                onSelect={handleChooseBodyType('request', 'type')}
                                            />
                                            <CodeMirror
                                                className={cn('editor')}
                                                value={body.request.value || ''}
                                                options={getCodeMirrorConfig(body.request.type)}
                                                onBeforeChange={handleChangeBody('request')}
                                            />
                                        </div>
                                    </SimulationFieldsBlock>
                                )}
                            </div>
                        </CollapseWrapper>
                        <CollapseWrapper isOpenDefault title="Response">
                            <div className={cn('collapse-content')}>
                                <SimulationFieldsBlock title="Status code">
                                    <div className={cn('fields')}>
                                        {renderField(
                                            handleChangeCurrentResponse('status', true),
                                            `${currentPair?.response.status}`,
                                            {
                                                placeholder: '200',
                                                name: 'statusCode',
                                                inputMask: '999',
                                                inputMode: 'numeric',
                                                onBlurField: handleBlurCurrentResponse('statusCode'),
                                            },
                                        )}
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
                                                        { placeholder: 'Header key' },
                                                    )}
                                                    {renderField(
                                                        handleChangeHeaderQuery('response', 'value', index),
                                                        header.value,
                                                        { placeholder: 'Header value(s)' },
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
                                            onSelect={handleChooseBodyType('response', 'type')}
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
