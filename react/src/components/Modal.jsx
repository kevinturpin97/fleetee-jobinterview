/**
 * Why not in simple function(){} ? In case we want to add forwardRef or memo for performance optimization
 */
const Modal = ({ children, isOpen, close }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className={"fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center"} onClick={(e) => {
            if (e.target === e.currentTarget) {
                e.stopPropagation();
                close();
            }
        }}>
            {children}
        </div>
    );
};

export default Modal;