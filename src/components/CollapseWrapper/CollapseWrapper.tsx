import React, { useState } from 'react';
import { Collapse, Header } from '@megafon/ui-core';
import { cnCreate } from '@megafon/ui-helpers';
import { ReactComponent as ArrowDown } from '@megafon/ui-icons/system-24-arrow_down_24.svg';
import { ReactComponent as ArrowUp } from '@megafon/ui-icons/system-24-arrow_up_24.svg';
import './CollapseWrapper.pcss';

type CollapseWrapperProps = {
    isOpenDefault?: boolean;
    title: string;
};

const cn = cnCreate('collapse-wrapper');
const CollapseWrapper: React.FC<CollapseWrapperProps> = ({ isOpenDefault, children, title }): JSX.Element => {
    const [state, setState] = useState<boolean>(!!isOpenDefault);

    function handleChange(): void {
        setState(prev => !prev);
    }

    return (
        <>
            <button type="button" className={cn('title-wrap')} onClick={handleChange}>
                <div className={cn('icon-box')}>{state ? <ArrowUp /> : <ArrowDown />}</div>
                <Header className={cn('title')} as="h3">
                    {title}
                </Header>
            </button>
            <Collapse className={cn('collapse')} classNameContainer={cn('collapse-container')} isOpened={state}>
                {children}
            </Collapse>
        </>
    );
};

export default CollapseWrapper;
