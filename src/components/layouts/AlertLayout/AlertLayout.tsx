import React, { useEffect } from 'react';
import { useAlert } from 'react-alert';
import NotificationContent from 'components/NotificationContent/NotificationContent';
import { useSelector } from 'store/hooks';

const MAX_MESSAGE_LENGTH = 250;

type DetailType = Event & {
    detail: {
        title: string;
        message: string;
        isError?: boolean;
    };
};

const AlertLayout: React.FC = ({ children }): JSX.Element => {
    const alert = useAlert();
    const isOnline = useSelector(state => state.status.value);

    const renderAlert = ({ detail }: DetailType) => {
        const { title, message, isError } = detail;
        const parseMessage =
            message.length > MAX_MESSAGE_LENGTH ? `${message.substr(0, MAX_MESSAGE_LENGTH)}...` : message;

        isOnline && alert.show(<NotificationContent title={title} message={parseMessage} isError={isError} />);
    };

    useEffect(() => {
        document.addEventListener('alert', renderAlert);

        return () => {
            document.removeEventListener('alert', renderAlert);
        };
    });

    return <div>{children}</div>;
};

export default AlertLayout;
