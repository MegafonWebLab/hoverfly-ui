import React from 'react';
import { Accordion } from '@megafon/ui-core';

type AccordionWrapperProps = { isOpenDefault?: boolean; title: string };

const AccordionWrapper: React.FC<AccordionWrapperProps> = ({ isOpenDefault, children, title }) => {
    const [state, setState] = React.useState<boolean>(!!isOpenDefault);

    function handleChange() {
        setState(prev => !prev);
    }

    return (
        <Accordion title={title} isOpened={state} onClickAccordion={handleChange}>
            {children}
        </Accordion>
    );
};

export default AccordionWrapper;
