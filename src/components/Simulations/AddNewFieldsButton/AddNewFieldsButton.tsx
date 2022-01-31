import React from 'react';
import { Button } from '@megafon/ui-core';
import { cnCreate } from '@megafon/ui-helpers';
import { ReactComponent as Plus } from '@megafon/ui-icons/system-16-plus_16.svg';
import './AddNewFieldsButton.pcss';

type AddNewFieldsButtonProps = {
    onClick: () => void;
    className?: string;
    emptyBlock?: boolean;
};

const cn = cnCreate('add-new-fields-button');
const AddNewFieldsButton: React.FC<AddNewFieldsButtonProps> = ({ onClick, className, emptyBlock }): JSX.Element => (
    <div className={cn('container')}>
        <div className={className}>
            {emptyBlock ? (
                <Button className={cn('add-first-button')} actionType="button" sizeAll="small" onClick={onClick}>
                    <Plus className={cn('icon')} />
                </Button>
            ) : (
                <button className={cn('add-new-button')} type="button" onClick={onClick}>
                    + Add new
                </button>
            )}
        </div>
    </div>
);

export default AddNewFieldsButton;
