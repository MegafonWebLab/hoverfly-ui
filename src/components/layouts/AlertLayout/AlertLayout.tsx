import React, { useEffect } from 'react';
import { useAlert } from 'react-alert';
import NotificationContent from 'components/NotificationContent/NotificationContent';

type DetailType = Event & {
    detail: {
        title: string;
        message: string;
        isError?: boolean;
    };
};

const AlertLayout: React.FC = ({ children }): JSX.Element => {
    const alert = useAlert();

    const renderAlert = ({ detail }: DetailType) => {
        const { title, message, isError } = detail;

        alert.show(<NotificationContent title={title} message={message} isError={isError} />);
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
