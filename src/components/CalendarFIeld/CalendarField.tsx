import React from 'react';
import { Calendar } from '@megafon/ui-core';
import { cnCreate } from '@megafon/ui-helpers';
import { ReactComponent as DownIcon } from '@megafon/ui-icons/system-16-arrow-list_down_16.svg';
import format from 'date-fns/format';
import './CalendarField.pcss';
import { useSelector } from 'store/hooks';

interface ICalendarFieldProps {
    className?: string;
    value?: Date;
    onChange?: (value: Date) => void;
}

const cn = cnCreate('calendar-field');
const CalendarField: React.FC<ICalendarFieldProps> = ({ value, className, onChange }) => {
    const statusState = !!useSelector(state => state.status.value);
    const [isOpen, setIsOpen] = React.useState<boolean>(false);
    const wrapperRef = React.useRef<HTMLDivElement | null>(null);

    function handleOpen() {
        statusState && setIsOpen(true);
    }

    React.useEffect(() => {
        function handleClickOutside(e: MouseEvent): void {
            if (!isOpen || (e.target instanceof Node && wrapperRef.current?.contains(e.target))) {
                return;
            }

            setIsOpen(false);
        }
        document.addEventListener('click', handleClickOutside);

        return (): void => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [isOpen, setIsOpen]);

    return (
        <div className={cn([className])}>
            <div className={cn('field', { value: !!value, disabled: !statusState })} onClick={handleOpen} aria-hidden>
                {value ? format(value, 'dd.MM.yyyy') : 'From'}
                <DownIcon className={cn('icon')} />
            </div>
            <div ref={wrapperRef} className={cn('calendar', { open: isOpen })}>
                <Calendar isSingleDate startDate={value} onChange={onChange} />
            </div>
        </div>
    );
};

export default CalendarField;
