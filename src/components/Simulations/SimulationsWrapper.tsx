import React, { useEffect } from 'react';
import type { SimulationResponse } from 'api/types';
import { useDispatch, useSelector } from 'store/hooks';
import { createSimulationAsync, getSimulationAsync } from 'store/simulation/simulationSlice';
import Simulation from './Simulation/Simulation';
import Simulations from './Simulations';

type SimulationsWrapperViewState = 'list' | 'edit' | 'new';

const SimulationsWrapper: React.FC = (): JSX.Element => {
    const dispatch = useDispatch();
    const statusState = !!useSelector(state => state.status.value);
    const simulationStore = useSelector(state => state.simulation);

    const [view, setView] = React.useState<SimulationsWrapperViewState>('list');
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
                setView('edit');
                setRouteIndex(index);
                break;
            }
            case 'delete': {
                index !== undefined && removeSimulation(index);
                break;
            }
            default:
            case 'new': {
                setView('new');
            }
        }
    }

    function handleChange(newState: SimulationResponse) {
        setIsUpdating(true);
        dispatch(createSimulationAsync({ data: newState, type: 'simulation' }));
    }

    function handleBack() {
        setView('list');
    }

    useEffect(() => {
        statusState && dispatch(getSimulationAsync());
    }, [statusState]);

    useEffect(() => {
        if (simulationStore.type === 'success' && isUpdating) {
            setView('list');
            setIsUpdating(false);
        }
    }, [isUpdating, simulationStore.type]);

    switch (view) {
        default:
        case 'list':
            return <Simulations onChange={handleChangeSimulation} />;
        case 'edit':
            return <Simulation routeIndex={routeIndex} onBack={handleBack} onChange={handleChange} />;
        case 'new':
            return <Simulation onBack={handleBack} onChange={handleChange} />;
    }
};

export default SimulationsWrapper;
