import React, { useEffect, useState } from 'react';
import { TextField } from '@megafon/ui-core';
import { cnCreate } from '@megafon/ui-helpers';
import CollapseWrapper from 'components/CollapseWrapper/CollapseWrapper';
import { useDispatch, useSelector } from 'store/hooks';
import { deletePacAsync, getPacAsync, updatePacAsync } from 'store/pac/pacSlice';
import ServerSettingsButton from '../ServerSettingsButton/ServerSettingsButton';
import './ServerSettingsPAC.pcss';

const cn = cnCreate('server-settings-pac');
const ServerSettingsPAC: React.FC = () => {
    const dispatch = useDispatch();

    const statusState = !!useSelector(state => state.status.value);
    const pacStore = useSelector(state => state.pac);

    const [script, setScript] = useState<string>('');

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>): void {
        setScript(e.target.value);
    }

    function handleFileSubmit(): void {
        if (script) {
            dispatch(updatePacAsync(script));
        } else {
            dispatch(deletePacAsync());
        }
    }

    useEffect(() => {
        if (pacStore.type !== 'success') {
            return;
        }

        typeof pacStore.value === 'string' && setScript(pacStore.value);
    }, [pacStore]);

    useEffect(() => {
        statusState && dispatch(getPacAsync());
    }, [statusState, dispatch]);

    return (
        <div className={cn()}>
            <CollapseWrapper title="PAC">
                <TextField
                    classes={{ input: cn('input') }}
                    value={script}
                    textarea="flexible"
                    onChange={handleFileChange}
                    isControlled
                />
                <ServerSettingsButton text="Set PAC file" disabled={!statusState} onClick={handleFileSubmit} />
            </CollapseWrapper>
        </div>
    );
};

export default ServerSettingsPAC;
