import React from 'react';
import { cnCreate } from '@megafon/ui-helpers';
import './Layout.pcss';

const cn = cnCreate('layout');
const Layout: React.FC = ({ children }) => <div className={cn()}>{children}</div>;

export default Layout;
