import React from 'react';
import { cnCreate } from '@megafon/ui-helpers';
import { ReactComponent as SuccessIcon } from '@megafon/ui-icons/system-16-checked_16.svg';
import { ReactComponent as ErrorIcon } from '@megafon/ui-icons/system-16-info_16.svg';
import './NotificationContent.pcss';

type NotificationContentProps = {
    title: string;
    message: string;
    isError?: boolean;
};

const cn = cnCreate('notification-content');
const NotificationContent: React.FC<NotificationContentProps> = ({ title, message, isError = true }): JSX.Element => (
    <>
        {isError ? <ErrorIcon className={cn('error-icon')} /> : <SuccessIcon className={cn('success-icon')} />}
        <div className={cn('content')}>
            <h5>{title}</h5>
            <span>{message}</span>
        </div>
    </>
);

export default NotificationContent;
