import React, { useEffect, useState } from 'react';
import { Button, Header, TextField } from '@megafon/ui-core';
import { cnCreate } from '@megafon/ui-helpers';
import CollapseWrapper from 'components/CollapseWrapper/CollapseWrapper';
import editIcon from 'static/favicon/edit-icon.svg';
import { useDispatch, useSelector } from 'store/hooks';
import { getDestinationAsync, updateDestinationAsync } from 'store/proxy/destinationSlice';
import { getUpstreamProxyAsync } from 'store/proxy/upstreamProxySlice';
import ServerSettingsButton from '../ServerSettingsButton/ServerSettingsButton';
import './ServerSettingsProxy.pcss';

const cn = cnCreate('server-settings-proxy');
const ServerSettingsProxy: React.FC = () => {
    const dispatch = useDispatch();

    const statusState = !!useSelector(state => state.status.value);
    const destinationStore = useSelector(state => state.destination);
    const upstreamStore = useSelector(state => state.upstreamProxy);

    const [editable, setEditable] = useState<boolean>(false);
    const [destination, setDestination] = useState<string>('-');
    const [upstream, setUpstream] = useState<string>('link anywhere');

    function closeDestinationEditForm(): void {
        setEditable(false);
    }

    function handleDestinationEditButtonClick(): void {
        setEditable(prev => !prev);
    }

    function handleDestinationEditFormChange(_e: React.ChangeEvent<HTMLInputElement>): void {
        setDestination(_e.target.value);
    }

    function handleSaveButtonClick(): void {
        closeDestinationEditForm();
        dispatch(updateDestinationAsync({ destination }));
    }

    useEffect(() => {
        if (statusState) {
            dispatch(getDestinationAsync());
            dispatch(getUpstreamProxyAsync());
        }
    }, [statusState, dispatch]);

    useEffect(() => {
        if (destinationStore.type === 'success') {
            setDestination(destinationStore.value.destination);
        }
    }, [destinationStore]);

    useEffect(() => {
        if (upstreamStore.type === 'success') {
            setUpstream(upstreamStore.value.upstreamProxy);
        }
    }, [upstreamStore]);

    const destinationTextField: JSX.Element = (
        <form onSubmit={closeDestinationEditForm}>
            <TextField
                value={destination}
                onChange={handleDestinationEditFormChange}
                onBlur={closeDestinationEditForm}
            />
        </form>
    );

    return (
        <div className={cn()}>
            <CollapseWrapper title="Proxy settings">
                <div className={cn('wrapper')}>
                    <div className={cn('destination-wrap')}>
                        <Header className={cn('title')} as="h5">
                            Destination
                        </Header>
                        <div className={cn('destination-edit-block')}>
                            {editable ? destinationTextField : <span>{destination}</span>}
                            <Button
                                theme="white"
                                sizeAll="small"
                                icon={<img src={editIcon} alt="edit icon" />}
                                onClick={handleDestinationEditButtonClick}
                            />
                        </div>
                    </div>
                    <div className={cn('upstream-wrap')}>
                        <Header className={cn('title')} as="h5">
                            Upstream proxy
                        </Header>
                        <span>{upstream}</span>
                    </div>
                </div>
                <ServerSettingsButton
                    text="Save proxy settings"
                    disabled={!statusState}
                    onClick={handleSaveButtonClick}
                />
            </CollapseWrapper>
        </div>
    );
};

export default ServerSettingsProxy;
