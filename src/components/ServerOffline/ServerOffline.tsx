import React from 'react';
import { Paragraph } from '@megafon/ui-core';
import { cnCreate } from '@megafon/ui-helpers';
import { ReactComponent as AlertIcon } from '@megafon/ui-icons/system-16-info_16.svg';
import { useSelector } from 'store/hooks';
import './ServerOffline.pcss';

const cn = cnCreate('server-offline');
const ServerOffline: React.FC = () => {
    const statusState = !!useSelector(({ status }) => status.type === 'success');

    return React.useMemo(
        () =>
            !statusState ? (
                <div className={cn()}>
                    <AlertIcon className={cn('icon')} />
                    <Paragraph hasMargin={false}>Hoverfly server is offline</Paragraph>
                </div>
            ) : null,
        [statusState],
    );
};

export default ServerOffline;
