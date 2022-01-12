import React from 'react';
import { Tile } from '@megafon/ui-core';
import { cnCreate } from '@megafon/ui-helpers';
import { ReactComponent as CancelIcon } from '@megafon/ui-icons/system-16-cancel_16.svg';
import type { AlertComponentPropsWithStyle } from 'react-alert';
import './Notification.pcss';

type NotificationProps = AlertComponentPropsWithStyle;

const cn = cnCreate('notification');
const Notification: React.FC<NotificationProps> = ({ id, message, style, close }): JSX.Element => (
    <div style={style} id={id}>
        <Tile className={cn('container')} radius="rounded" shadowLevel="high" theme="light">
            {message}
            <button className={cn('cancel-button')} type="button" onClick={close}>
                <CancelIcon className={cn('cancel-icon')} />
            </button>
        </Tile>
    </div>
);

export default Notification;
