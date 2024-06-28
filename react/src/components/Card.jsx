import { useEffect, useRef } from 'react';
import placeholder_thumbnail from '../assets/img/placeholder_thumbnail.svg';

function Card({ data, userData = false }) {
    const { id, name, picture, thumbnail, release_date, genres, overview, episode, season } = data;
    const pictureRef = useRef(null);

    // Preload image by saving it in the browser cache
    const preloadImage = () => {
        if (!thumbnail) { return; }

        const img = new Image();
        img.src = 'https://image.tmdb.org/t/p/w500' + thumbnail;
        img.onload = () => {
            pictureRef.current.src = img.src;
        }
    }

    useEffect(() => {
        preloadImage();
    }, [thumbnail]);

    return (
        <div id={'card-' + id} title={name} className={'flex flex-col bg-slate-600 p-4 rounded shadow-md h-full w-full' + (!userData ? ' hover:cursor-pointer hover:shadow-lg hover:scale-105' : '')}>
            <img ref={pictureRef} src={placeholder_thumbnail} alt={name} className='w-full h-auto object-contain rounded mb-4' />
            <h4 className='text-white font-bold text-xl'>{name}</h4>
            <p className='text-white text-sm'>{release_date}</p>
            {!userData && (
                <>
                    <p className='text-white text-sm line-clamp-3'>{overview}</p>
                    <p className='text-white text-sm font-semibold mt-auto'>{genres.join(', ')}</p>
                </>
            )}
            {season && episode && (<p className='text-white text-sm font-semibold mt-auto'>Saison {season} - Episode {episode}</p>)}
        </div>
    )
}

function CardSkeleton() {
    return (
        <div className='bg-slate-600 p-4 rounded shadow-md w-full'>
            <div className='animate-pulse bg-gray-300 h-52 rounded mb-4' />
            <div className='animate-pulse bg-gray-300 h-4 w-1/2 rounded mb-2' />
            <div className='animate-pulse bg-gray-300 h-4 w-1/4 rounded mb-2' />
            <div className='animate-pulse bg-gray-300 h-4 w-1/4 rounded mb-2' />
            <div className='animate-pulse bg-gray-300 h-4 w-1/2 rounded mb-2' />
        </div>
    )
}

export { Card, CardSkeleton }