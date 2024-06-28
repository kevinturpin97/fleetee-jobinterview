import { useEffect, useState } from 'react'

export default function Error() {
    const [timeBeforeRedirect, setTimeBeforeRedirect] = useState(3);

    useEffect(() => {
        const delay = setInterval(() => {
            setTimeBeforeRedirect((lastCount) => lastCount - 1);
        }, 1000);

        // memory dump to avoid leak and re-render
        return () => clearInterval(delay);
    }, []);

    useEffect(() => {
        if (timeBeforeRedirect === 0) {
            // hard refresh to avoid any cache
            window.location.href = '/';
        }
    }, [timeBeforeRedirect]);

    return (
        <div className='w-full h-screen flex flex-col justify-center items-center space-y-2'>
            <p className='text-gray-700 text-2xl font-semibold ml-4'>La page que vous cherchez n'existe pas.</p>
            <p className='text-gray-700 text-xl font-semibold ml-4'>Redirection dans {timeBeforeRedirect} seconde{timeBeforeRedirect > 1 ? 's' : ''}.</p>
        </div>
    );
}
