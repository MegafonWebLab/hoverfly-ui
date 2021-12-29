import React from 'react';
import { Button, TextField } from '@megafon/ui-core';
import { cnCreate } from '@megafon/ui-helpers';
import { ReactComponent as Edit } from '@megafon/ui-icons/basic-16-edit_16.svg';
import './ProxyInfo.pcss';
import AccordionWrapper from 'components/AccordionWrapper/AccordionWrapper';
import { useDispatch, useSelector } from 'store/hooks';
import { getDestinationAsync, updateDestinationAsync } from 'store/proxy/destinationSlice';
import { getUpstreamProxyAsync } from 'store/proxy/upstreamProxySlice';

const cn = cnCreate('proxy-info');
const ProxyInfo: React.FC = () => {
    const dispatch = useDispatch();
    const statusState = !!useSelector(state => state.status.value);
    const destinationStore = useSelector(state => state.destination);
    const upstreamStore = useSelector(state => state.upstreamProxy);

    const [editable, setEditable] = React.useState<boolean>(false);
    const [destination, setDestination] = React.useState<string>('');
    const [upstream, setUpstream] = React.useState<string>('');

    function handleChangeEdit(_e: React.MouseEvent<HTMLButtonElement>) {
        setEditable(prev => !prev);
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setDestination(e.target.value);
    }

    function handleClickSubmit(_e: React.MouseEvent<HTMLButtonElement>) {
        setEditable(false);
        dispatch(updateDestinationAsync({ destination }));
    }

    React.useEffect(() => {
        if (statusState) {
            dispatch(getDestinationAsync());
            dispatch(getUpstreamProxyAsync());
        }
    }, [statusState]);

    React.useEffect(() => {
        if (destinationStore.type === 'success') {
            setDestination(destinationStore.value.destination);
        }
    }, [destinationStore.type]);

    React.useEffect(() => {
        if (upstreamStore.type === 'success') {
            setUpstream(upstreamStore.value.upstreamProxy);
        }
    }, [upstreamStore.type]);

    const renderEditButton = (
        <Button
            className={cn('edit-button')}
            theme="purple"
            sizeAll="small"
            icon={<Edit className={cn('edit-icon')} />}
            onClick={handleChangeEdit}
        />
    );

    const renderTextField = <TextField classes={{ input: cn('field') }} value={destination} onChange={handleChange} />;

    return (
        <div className={cn()}>
            <AccordionWrapper title="Proxy settings">
                <table className={cn('table')}>
                    <tbody>
                        <tr>
                            <td className={cn('cell')} width="45%">
                                <div className={cn('cell-box')}>{renderEditButton} Destination</div>
                            </td>
                            <td className={cn('cell')}>
                                {editable ? renderTextField : <div className={cn('cell-text')}>{destination}</div>}
                            </td>
                        </tr>
                        <tr>
                            <td className={cn('cell')} width="45%">
                                Upstream proxy
                            </td>
                            <td className={cn('cell')}>
                                <div className={cn('cell-text')}>{upstream}</div>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div className={cn('footer')}>
                    <Button
                        className={cn('action-button')}
                        actionType="button"
                        disabled={!statusState}
                        sizeAll="small"
                        onClick={handleClickSubmit}
                    >
                        Save settings
                    </Button>
                </div>
            </AccordionWrapper>
        </div>
    );
};

export default ProxyInfo;
