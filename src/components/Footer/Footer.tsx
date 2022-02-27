import React from 'react';
import { TextLink } from '@megafon/ui-core';
import { cnCreate } from '@megafon/ui-helpers';
import './Footer.pcss';

const cn = cnCreate('footer');
const Footer: React.FC = () => (
    <footer className={cn()}>
        <div>
            <TextLink color="blue" href="https://www.megafon.ru" target="_blank" rel="noopener noreferrer">
                MegaFon
            </TextLink>
        </div>
        <span>
            Developed with <span className={cn('heart')}>❤</span>
        </span>
    </footer>
);

export default Footer;
