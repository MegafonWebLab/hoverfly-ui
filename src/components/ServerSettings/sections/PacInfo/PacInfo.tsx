import React from 'react';
import { Button, TextField } from '@megafon/ui-core';
import { cnCreate } from '@megafon/ui-helpers';
import { useDispatch, useSelector } from 'store/hooks';
import { deletePacAsync, getPacAsync, updatePacAsync } from 'store/pac/pacSlice';
import './PacInfo.pcss';
import AccordionWrapper from 'components/AccordionWrapper/AccordionWrapper';

const cn = cnCreate('pac-info');
const PacInfo: React.FC = () => {
    const dispatch = useDispatch();
    const statusState = !!useSelector(state => state.status.value);
    const pacStore = useSelector(state => state.pac);

    const [state, setState] = React.useState<string>('');

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setState(e.target.value);
    }

    function handleSubmit() {
        if (state) {
            dispatch(updatePacAsync(state));

            return;
        }
        dispatch(deletePacAsync());
    }

    React.useEffect(() => {
        if (pacStore.type === 'success') {
            if (typeof pacStore.value === 'string') {
                setState(pacStore.value);
            }
        }
    }, [pacStore.type === 'success']);

    React.useEffect(() => {
        if (statusState) {
            dispatch(getPacAsync());
        }
    }, [statusState]);

    return (
        <div className={cn()}>
            <AccordionWrapper title="PAC">
                <TextField
                    className={cn('field-wrapper')}
                    classes={{ input: cn('field') }}
                    value={state}
                    textarea="flexible"
                    onChange={handleChange}
                />
                <Button sizeAll="small" actionType="button" fullWidth disabled={!statusState} onClick={handleSubmit}>
                    Set Pac file
                </Button>
            </AccordionWrapper>
        </div>
    );
};

export default PacInfo;
