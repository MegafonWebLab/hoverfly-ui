import React from 'react';
import { Button, Grid, GridColumn, Header, TextField } from '@megafon/ui-core';
import { cnCreate } from '@megafon/ui-helpers';
import { ReactComponent as Edit } from '@megafon/ui-icons/basic-16-edit_16.svg';
import { ReactComponent as Minus } from '@megafon/ui-icons/system-16-minus_16.svg';
import { ReactComponent as Plus } from '@megafon/ui-icons/system-16-plus_16.svg';
import './StateManagement.pcss';
import type { ServerState } from 'api/types';
import { useDispatch, useSelector } from 'store/hooks';
import { addServerStateAsync, clearServerStateAsync } from 'store/serverState/serverStateSlice';

type LocalStateItem = { name: string; value: string; editable: boolean };

function stateToList(state: ServerState): LocalStateItem[] {
    return Object.entries(state.state).map(([name, value]) => ({ value, name, editable: false }));
}

function listToState(stateList: LocalStateItem[]): ServerState {
    return {
        state: stateList.reduce((acc, item) => {
            acc[item.name] = item.value;

            return acc;
        }, {}),
    };
}

const INITIAL_END_FEATCH_LOADS = 3;

const cn = cnCreate('state-management');
const StateManagement: React.FC = () => {
    const dispatch = useDispatch();
    const serverState = useSelector(state => state.serverState);
    const statusState = useSelector(state => state.status.value);

    const stateLoads = React.useRef<number>(0);
    const [localState, setLocalState] = React.useState<LocalStateItem[]>(stateToList(serverState.value));
    const hasServerState = !!Object.keys(serverState.value.state).length;

    function handleClickAdd(_e: React.MouseEvent<HTMLButtonElement>) {
        dispatch(addServerStateAsync(listToState(localState)));
    }

    function handleClickClear(_e: React.MouseEvent<HTMLButtonElement>) {
        setLocalState([]);
        dispatch(clearServerStateAsync());
    }

    function handleChangeState(field: 'name' | 'value', index: number) {
        return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setLocalState(state => {
                const newState = [...state];
                newState[index][field] = e.target.value;

                return newState;
            });
        };
    }

    function handleClickEdit(index: number, editable: boolean) {
        return (_e: React.MouseEvent<HTMLButtonElement>) => {
            setLocalState(state => {
                const newState = [...state];
                newState[index].editable = !editable;

                return newState;
            });
        };
    }

    function handleClickRemove(index: number) {
        return (_e: React.MouseEvent<HTMLButtonElement>) => {
            setLocalState(state => {
                const newState = [...state];
                // eslint-disable-next-line no-magic-numbers
                newState.splice(index, 1);

                return newState;
            });
        };
    }

    function handleClickPlus(_e: React.MouseEvent<HTMLButtonElement>) {
        setLocalState(state => [...state, { name: '', value: '', editable: true }]);
    }

    const header = React.useMemo(
        () => (
            <Header as="h3" className={cn('title')}>
                State
            </Header>
        ),
        [],
    );

    React.useEffect(() => {
        if (stateLoads.current < INITIAL_END_FEATCH_LOADS) {
            setLocalState(stateToList(serverState.value));
            stateLoads.current += 1;
        }
    }, [serverState]);

    return (
        <div className={cn()}>
            {header}
            <div className={cn('list')}>
                {localState.map(({ name, value, editable }, index) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <div className={cn('list-item')} key={index}>
                        <div className={cn('edit-buttons')}>
                            <Button
                                className={cn('icon-button', { first: true })}
                                type="outline"
                                theme="purple"
                                sizeAll="small"
                                icon={<Minus className={cn('minus-icon')} />}
                                onClick={handleClickRemove(index)}
                            />
                            <Button
                                className={cn('icon-button')}
                                theme="purple"
                                sizeAll="small"
                                icon={<Edit className={cn('edit-icon')} />}
                                onClick={handleClickEdit(index, editable)}
                            />
                        </div>
                        <div className={cn('key-value')}>
                            {editable ? (
                                <TextField
                                    classes={{ input: cn('field') }}
                                    value={name}
                                    onChange={handleChangeState('name', index)}
                                />
                            ) : (
                                <span className={cn('name')}>{name}</span>
                            )}
                            :
                            {editable ? (
                                <TextField
                                    classes={{ input: cn('field') }}
                                    value={value}
                                    onChange={handleChangeState('value', index)}
                                />
                            ) : (
                                <span className={cn('value')}>{value}</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <Button className={cn('plus-button')} sizeAll="small" icon={<Plus />} onClick={handleClickPlus} />
            <div className={cn('action-buttons')}>
                <Grid>
                    <GridColumn all="5" mobile="12" tablet="12">
                        <Button
                            className={cn('add-button')}
                            onClick={handleClickAdd}
                            sizeAll="small"
                            disabled={!statusState}
                        >
                            {hasServerState ? 'Update' : 'Add'}
                        </Button>
                    </GridColumn>
                    <GridColumn all="5" mobile="12" tablet="12">
                        <Button onClick={handleClickClear} sizeAll="small" theme="purple" disabled={!statusState}>
                            Clear
                        </Button>
                    </GridColumn>
                </Grid>
            </div>
        </div>
    );
};

export default StateManagement;
