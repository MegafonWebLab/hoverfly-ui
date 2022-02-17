import React from 'react';
import { Paragraph } from '@megafon/ui-core';
import { cnCreate } from '@megafon/ui-helpers';
import { ReactComponent as AlertIcon } from '@megafon/ui-icons/system-16-info_16.svg';
import { useSelector } from 'store/hooks';
import './ServerOffline.pcss';

const cn = cnCreate('server-offline');
const ServerOffline: React.FC = () => {
    const isError = !!useSelector(({ status }) => status.type === 'error');

    return React.useMemo(
        () =>
            isError ? (
                <div className={cn()}>
                    <AlertIcon className={cn('icon')} />
                    <Paragraph hasMargin={false}>Hoverfly server is offline</Paragraph>
                </div>
            ) : null,
        [isError],
    );
};

export default ServerOffline;
