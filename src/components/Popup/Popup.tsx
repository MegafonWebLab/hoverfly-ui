import React from 'react';
import { cnCreate } from '@megafon/ui-helpers';
import Modal from 'react-modal';
import './Popup.pcss';

const HEIGHT_DELIMETER = 4;

interface IPopupProps {
    open: boolean;
    fade?: boolean;
    onClose?: () => void;
}

const cn = cnCreate('popup');
const Popup: React.FC<IPopupProps> = ({ open, children, fade, onClose }) => {
    const [offsetTop, setOffsetTop] = React.useState<number>(0);
    const nodeWrapperRef = React.useRef<HTMLDivElement | null>(null);

    function handleClose() {
        onClose?.();
    }

    React.useEffect(() => {
        const gutter = 20;
        let heightWrapper = 0;
        const screenHeight = window.innerHeight;
        const scrollValue = window.pageYOffset;

        if (nodeWrapperRef.current) {
            heightWrapper = nodeWrapperRef.current.offsetHeight;
        }

        if (heightWrapper > screenHeight && gutter) {
            setOffsetTop(scrollValue + gutter);

            return;
        }

        setOffsetTop(scrollValue + (screenHeight - heightWrapper) / HEIGHT_DELIMETER);
    }, [open]);

    return (
        <Modal
            isOpen={open}
            className={cn('content')}
            portalClassName={cn()}
            overlayClassName={cn('overlay')}
            bodyOpenClassName="popup-open"
            style={{
                content: { marginTop: `${offsetTop}px` },
            }}
            ariaHideApp={false}
            onRequestClose={handleClose}
        >
            <div className={cn('wrapper')}>{children}</div>
            {fade && <div className={cn('background')} />}
        </Modal>
    );
};
export default Popup;
