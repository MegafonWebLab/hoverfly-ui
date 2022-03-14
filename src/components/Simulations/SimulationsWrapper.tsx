import React, { useCallback, useEffect, useState } from 'react';
import { Button, Paragraph } from '@megafon/ui-core';
import { cnCreate } from '@megafon/ui-helpers';
import { Route, Routes, useNavigate } from 'react-router-dom';
import type { SimulationResponse } from 'api/types';
import Popup from 'components/Popup/Popup';
import { useDispatch, useSelector } from 'store/hooks';
import { createSimulationAsync, getSimulationAsync } from 'store/simulation/simulationSlice';
import Simulation from './Simulation/Simulation';
import Simulations from './Simulations';
import './SimulationsWrapper.pcss';

enum SimulationRoutes {
    INDEX = '/simulations',
    EDIT = '/simulations/edit',
    NEW = '/simulations/new',
}

const cn = cnCreate('simulations-wrapper');
const SimulationsWrapper: React.FC = (): JSX.Element => {
    const dispatch = useDispatch();
    const statusState = !!useSelector(state => state.status.value);
    const simulationStore = useSelector(state => state.simulation);

    const nav = useNavigate();
    const [isUpdating, setIsUpdating] = useState<boolean>(false);
    const [pathValue, setPathValue] = useState<string>('');
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [deleteIndex, setDeleteIndex] = useState<number | undefined>(undefined);

    function handlePopupDelete(index: number) {
        if (simulationStore.type === 'success') {
            const pair = simulationStore.value.data.pairs[index];

            setPathValue(`${pair.request?.method?.[0].value || ''} ${pair.request?.path?.[0].value}`);
            setDeleteIndex(index);
            setIsOpen(true);
        }
    }

    const handleClose = useCallback(() => {
        setDeleteIndex(undefined);
        setIsOpen(false);
    }, []);

    function removeSimulation(index: number) {
        if (simulationStore.type === 'success') {
            const pairs = [...simulationStore.value.data.pairs];
            pairs.splice(index, 1);

            const newSimulations: SimulationResponse = {
                ...simulationStore.value,
                data: {
                    ...simulationStore.value.data,
                    pairs,
                },
            };

            dispatch(createSimulationAsync({ data: newSimulations, type: 'simulation' }));
        }
    }

    function handleChangeSimulation(index: number | undefined, type: 'edit' | 'delete' | 'new') {
        switch (type) {
            case 'edit': {
                nav(`${SimulationRoutes.EDIT}/${index}`);
                break;
            }
            case 'delete': {
                index !== undefined && removeSimulation(index);
                break;
            }
            default:
            case 'new': {
                nav(SimulationRoutes.NEW);
            }
        }
    }

    function handleDelete() {
        setIsOpen(false);
        deleteIndex !== undefined && handleChangeSimulation(deleteIndex, 'delete');
        nav(`/simulations`);
    }

    function handleChange(newState: SimulationResponse) {
        setIsUpdating(true);
        dispatch(createSimulationAsync({ data: newState, type: 'simulation' }));
    }

    function handleBack() {
        nav(SimulationRoutes.INDEX);
    }

    useEffect(() => {
        if (simulationStore.type === 'success') {
            setDeleteIndex(undefined);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [simulationStore.type]);

    useEffect(() => {
        statusState && dispatch(getSimulationAsync());
    }, [dispatch, statusState]);

    useEffect(() => {
        if (simulationStore.type === 'success' && isUpdating) {
            nav(SimulationRoutes.INDEX);
            setIsUpdating(false);
        }
    }, [isUpdating, simulationStore.type, nav]);

    return (
        <>
            <Routes>
                <Route
                    path="/edit/:routeIndex"
                    element={<Simulation onBack={handleBack} onChange={handleChange} onDelete={handlePopupDelete} />}
                />
                <Route
                    path="/new"
                    element={<Simulation onBack={handleBack} onChange={handleChange} onDelete={handlePopupDelete} />}
                />
                <Route
                    path="/"
                    element={<Simulations onDelete={handlePopupDelete} onChange={handleChangeSimulation} />}
                />
            </Routes>
            <Popup open={isOpen} onClose={handleClose}>
                <Paragraph className={cn('popup-text')} align="center">
                    Delete {pathValue}?
                </Paragraph>
                <div className={cn('popup-buttons')}>
                    <Button
                        className={cn('popup-button', { delete: true })}
                        sizeAll="small"
                        type="outline"
                        actionType="button"
                        onClick={handleDelete}
                    >
                        Delete
                    </Button>
                    <Button sizeAll="small" type="outline" actionType="button" onClick={handleClose}>
                        Cancel
                    </Button>
                </div>
            </Popup>
        </>
    );
};

export default SimulationsWrapper;
