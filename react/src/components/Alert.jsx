import { useEffect, useState } from "react";

export default function Alert({ type, message }) {
    const [hasAlert, setHasAlert] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        
        const delay = setTimeout(() => {
            setHasAlert(false);
        }, 2500);

        return () => {
            clearTimeout(delay);
            setHasAlert(true);
        };
    }, []);

    if (!hasAlert) {
        return null;
    }

    return (
        <div className={'bg-' + (type === 'error' ? 'red' : (type === 'info' ? 'blue' : 'green')) + '-500 p-4 rounded w-full sm:w-1/2 mx-auto mt-5'}>
            <span className='block text-xl text-center'>{message}</span>
        </div>
    );
}
