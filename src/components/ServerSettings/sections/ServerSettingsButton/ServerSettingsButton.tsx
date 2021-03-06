import React from 'react';
import { Button } from '@megafon/ui-core';
import { cnCreate } from '@megafon/ui-helpers';
import './ServerSettingsButton.pcss';

type ServerSettingsButtonProps = {
    text: string;
    disabled?: boolean;
    onClick: (e: React.MouseEvent) => void;
};

const cn = cnCreate('server-settings-button');
const ServerSettingsButton: React.FC<ServerSettingsButtonProps> = ({ text, onClick, disabled }): JSX.Element => (
    <div className={cn('button-wrap')}>
        <Button type="outline" sizeAll="small" disabled={disabled} onClick={onClick}>
            <span className={cn('button-text')}>{text}</span>
        </Button>
    </div>
);

export default ServerSettingsButton;
