import React from 'react';
import { Collapse, Header } from '@megafon/ui-core';
import { ReactComponent as ArrowDown } from '@megafon/ui-icons/system-24-arrow_down_24.svg';
import { ReactComponent as ArrowUp } from '@megafon/ui-icons/system-24-arrow_up_24.svg';
import './CollapseWrapper.pcss';
import { cnCreate } from '@megafon/ui-helpers';

type CollapseWrapperProps = {
    isOpenDefault?: boolean;
    title: string;
};

const cn = cnCreate('collapse-wrapper');
const CollapseWrapper: React.FC<CollapseWrapperProps> = ({ isOpenDefault, children, title }) => {
    const [state, setState] = React.useState<boolean>(!!isOpenDefault);

    function handleChange() {
        setState(prev => !prev);
    }

    return (
        <>
            <div className={cn('title-wrap')} onClick={handleChange}>
                <div className={cn('icon-box', { open: state })}>{state ? <ArrowUp /> : <ArrowDown />}</div>
                <Header className={cn('title')} as="h3">
                    {title}
                </Header>
            </div>
            <Collapse className={cn('collapse')} classNameContainer={cn('collapse-container')} isOpened={state}>
                {children}
            </Collapse>
        </>
    );
};

export default CollapseWrapper;
