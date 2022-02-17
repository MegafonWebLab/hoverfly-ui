import React, { useState } from 'react';
import { Header, TextField } from '@megafon/ui-core';
import { cnCreate } from '@megafon/ui-helpers';
import debounce from 'lodash.debounce';
import type { SimulationResponse } from 'api/types';
import { useDispatch, useSelector } from 'store/hooks';
import { getDigits } from 'utils';
import { createSimulationAsync } from '../../store/simulation/simulationSlice';
import ServerSettingsCORS from './sections/ServerSettingsCORS/ServerSettingsCORS';
import ServerSettingsMiddleware from './sections/ServerSettingsMiddleware/ServerSettingsMiddleware';
import ServerSettingsMode from './sections/ServerSettingsMode/ServerSettingsMode';
import ServerSettingsPAC from './sections/ServerSettingsPAC/ServerSettingsPAC';
import ServerSettingsProxy from './sections/ServerSettingsProxy/ServerSettingsProxy';
import './ServerSettings.pcss';

const DEBOUNCE_MILLISECONDS = 500;

const cn = cnCreate('server-settings');
const ServerSettings: React.FC = (): JSX.Element => {
    const dispatch = useDispatch();
    const simulationStore = useSelector(state => state.simulation);
    const statusState = !!useSelector(state => state.status.value);

    const [globalDelay, setGlobalDelay] = useState('');

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const updateServer = React.useCallback(
        debounce((value: string) => {
            if (simulationStore.type === 'success') {
                const test: SimulationResponse = {
                    data: {
                        pairs: simulationStore.value.data.pairs,
                        globalActions: {
                            delays: [
                                {
                                    delay: Number(value),
                                    urlPattern: '.',
                                    httpMethod: '',
                                },
                            ],
                            delaysLogNormal: simulationStore.value.data.globalActions.delaysLogNormal,
                        },
                    },
                    meta: simulationStore.value.meta,
                };

                dispatch(createSimulationAsync({ data: test, type: 'setting' }));
            }
        }, DEBOUNCE_MILLISECONDS),
        [simulationStore.type],
    );

    function handleDelayInputChange(e: React.ChangeEvent<HTMLInputElement>): void {
        const val = getDigits(e.target.value);
        setGlobalDelay(val);

        if (val) {
            updateServer(val);
        }
    }

    React.useEffect(() => {
        if (simulationStore.type === 'success') {
            setGlobalDelay(String(simulationStore.value.data.globalActions.delays?.[0]?.delay || ''));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [simulationStore.type]);

    return (
        <div className={cn()}>
            <Header className={cn('header')} as="h1">
                Server settings
            </Header>
            <div className={cn('content-wrap')}>
                <div className={cn('global-delay')}>
                    <TextField
                        disabled={!statusState}
                        isControlled
                        value={globalDelay}
                        placeholder="Global Delay"
                        classes={{ input: cn('global-delay-input') }}
                        onChange={handleDelayInputChange}
                    />
                </div>
                <div className={cn('sections')}>
                    <ServerSettingsMiddleware />
                    <ServerSettingsMode />
                    <ServerSettingsPAC />
                    <ServerSettingsCORS />
                    <ServerSettingsProxy />
                </div>
            </div>
        </div>
    );
};

export default ServerSettings;
