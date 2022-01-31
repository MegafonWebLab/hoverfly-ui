import React from 'react';
import { cnCreate } from '@megafon/ui-helpers';
import AddNewFieldsButton from 'components/Simulations/AddNewFieldsButton/AddNewFieldsButton';
import './SimulationFieldsBlock.pcss';

type SimulationFieldsBlockProps = {
    title: string;
    hasAddButton?: boolean;
    children: React.ReactNode | React.ReactNode[];
    onAddButtonClick?: () => void;
};

const cn = cnCreate('simulation-fields-block');
const SimulationFieldsBlock: React.FC<SimulationFieldsBlockProps> = ({
    title,
    children,
    hasAddButton = false,
    onAddButtonClick,
}): JSX.Element => (
    <div className={cn('wrapper', { 'has-add-button': hasAddButton, empty: !children })}>
        <div className={cn('title')}>{title}</div>
        {children && <div className={cn('fields')}>{children}</div>}
        {onAddButtonClick && ((children && hasAddButton) || !children) && (
            <div className={cn('button')}>
                <AddNewFieldsButton emptyBlock={!children} onClick={onAddButtonClick} />
            </div>
        )}
    </div>
);

export default SimulationFieldsBlock;
