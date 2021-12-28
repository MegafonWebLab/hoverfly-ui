import React from 'react';
import { Accordion, Header } from '@megafon/ui-core';
import './AccordionWrapper.pcss';
import { cnCreate } from '@megafon/ui-helpers';

type AccordionWrapperProps = {
    isOpenDefault?: boolean;
    title: string;
};

const cn = cnCreate('accordion-wrapper');
const AccordionWrapper: React.FC<AccordionWrapperProps> = ({ isOpenDefault, children, title }) => {
    const [state, setState] = React.useState<boolean>(!!isOpenDefault);

    function handleChange() {
        setState(prev => !prev);
    }

    const header: React.ReactNode = (
        <Header className={cn('title')} as="h3">
            {title}
        </Header>
    );

    return (
        <Accordion
            title={header}
            isOpened={state}
            onClickAccordion={handleChange}
            classes={{
                root: cn('root'),
                titleWrap: cn('title-wrap'),
            }}
        >
            {children}
        </Accordion>
    );
};

export default AccordionWrapper;
