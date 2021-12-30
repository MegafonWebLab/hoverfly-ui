import React, { useEffect, useState } from 'react';
import { TextField } from '@megafon/ui-core';
import { cnCreate } from '@megafon/ui-helpers';
import AccordionWrapper from 'components/AccordionWrapper/AccordionWrapper';
import { useDispatch, useSelector } from 'store/hooks';
import { deletePacAsync, getPacAsync, updatePacAsync } from 'store/pac/pacSlice';
import ServerSettingsButton from '../ServerSettingsButton/ServerSettingsButton';
import './ServerSettingsPAC.pcss';

const cn = cnCreate('server-settings-pac');
const ServerSettingsPAC: React.FC = () => {
    const dispatch = useDispatch();

    const statusState = !!useSelector(state => state.status.value);
    const pacStore = useSelector(state => state.pac);

    const [state, setState] = useState<string>('');

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setState(e.target.value);
    }

    function handleSubmit() {
        return state ? dispatch(updatePacAsync(state)) : dispatch(deletePacAsync());
    }

    useEffect(() => {
        if (pacStore.type !== 'success') {
            return;
        }

        typeof pacStore.value === 'string' && setState(pacStore.value);
    }, [pacStore]);

    useEffect(() => {
        statusState && dispatch(getPacAsync());
    }, [statusState, dispatch]);

    return (
        <div className={cn()}>
            <AccordionWrapper title="PAC">
                <TextField value={state} textarea="flexible" onChange={handleChange} />
                <ServerSettingsButton text="Set PAC file" disabled={!statusState} onClick={handleSubmit} />
            </AccordionWrapper>
        </div>
    );
};

export default ServerSettingsPAC;
