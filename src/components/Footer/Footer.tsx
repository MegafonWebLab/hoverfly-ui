import React from 'react';
import { cnCreate } from '@megafon/ui-helpers';
import './Footer.pcss';
import { TextLink } from '@megafon/ui-core';

const cn = cnCreate('footer');
const Footer: React.FC = () => {
    return (
        <div className={cn()}>
            <div>
                2021. Developed with love by
                {'\u00A0'}
                <TextLink
                    color="blue"
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    MegaFon
                </TextLink>
                {'\u00A0'}
                CKO
            </div>
            <span>Open source project for free</span>
        </div>
    )
};

export default Footer;