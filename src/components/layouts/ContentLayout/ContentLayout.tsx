import React from 'react';
import { cnCreate } from '@megafon/ui-helpers';
import './ContentLayout.pcss';

const cn = cnCreate('content-layout');
const ContentLayout: React.FC = ({ children }) => <div className={cn()}>{children}</div>;

export default ContentLayout;
