import React, { useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import type { SimulationResponse } from 'api/types';
import { useDispatch, useSelector } from 'store/hooks';
import { createSimulationAsync, getSimulationAsync } from 'store/simulation/simulationSlice';
import Simulation from './Simulation/Simulation';
import Simulations from './Simulations';

enum SimulationRoutes {
    INDEX = '/simulations',
    EDIT = '/simulations/edit',
    NEW = '/simulations/new',
}

const SimulationsWrapper: React.FC = (): JSX.Element => {
    const dispatch = useDispatch();
    const statusState = !!useSelector(state => state.status.value);
    const simulationStore = useSelector(state => state.simulation);

    const nav = useNavigate();
    const [routeIndex, setRouteIndex] = React.useState<number | undefined>(undefined);
    const [isUpdating, setIsUpdating] = React.useState<boolean>(false);

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
                setRouteIndex(index);
                nav(SimulationRoutes.EDIT);
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

    function handleChange(newState: SimulationResponse) {
        setIsUpdating(true);
        dispatch(createSimulationAsync({ data: newState, type: 'simulation' }));
    }

    function handleBack() {
        nav(SimulationRoutes.INDEX);
    }

    useEffect(() => {
        statusState && dispatch(getSimulationAsync());
    }, [dispatch, statusState]);

    useEffect(() => {
        if (simulationStore.type === 'success' && isUpdating) {
            nav(SimulationRoutes.INDEX);
            setIsUpdating(false);
        }
    }, [isUpdating, simulationStore.type, nav]);

    useEffect(() => {
        if (window.location.pathname === SimulationRoutes.EDIT && routeIndex === undefined) {
            nav(SimulationRoutes.INDEX);
        }
    }, [routeIndex, nav]);

    return (
        <Routes>
            <Route
                path="/edit"
                element={<Simulation routeIndex={routeIndex} onBack={handleBack} onChange={handleChange} />}
            />
            <Route path="/new" element={<Simulation onBack={handleBack} onChange={handleChange} />} />
            <Route path="/" element={<Simulations onChange={handleChangeSimulation} />} />
        </Routes>
    );
};

export default SimulationsWrapper;
