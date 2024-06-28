import { useMainContext } from '../contexts/MainContext';
import { NavLink, useNavigate } from 'react-router-dom';
import { site_name } from '../assets/js/constants';
import { useEffect, useState } from 'react';

export default function Header() {
  const { isLog } = useMainContext();
  const [showCollapse, setShowCollapse] = useState(false);
  const navigator = useNavigate();

  useEffect(() => {
    window.addEventListener('resize', () => {
      if (window.innerWidth > 640) {
        setShowCollapse(false);
      }
    })

    return () => {
      window.removeEventListener('resize', () => {
        if (window.innerWidth > 640) {
          setShowCollapse(false);
        }
      })
    }
  }, []);

  return (
    <header className='bg-slate-600 p-4 mb-5'>
      <div className=' text-white flex flex-row justify-between'>
        <h1 className='text-2xl font-semibold hover:cursor-pointer' onClick={() => {
          if (showCollapse) {
            setShowCollapse(false);
          }

          navigator('/');
        }}>{site_name}</h1>
        <button className='sm:hidden' onClick={() => setShowCollapse(!showCollapse)}>
          <svg xmlns='http://www.w3.org/2000/svg' className='h-6 w-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16m-7 6h7' />
          </svg>
        </button>
        <nav className='hidden sm:flex flex-row space-x-2 items-center text-sm'>
          {isLog ? (
            <>
              <NavLink className={"px-2 py-1 bg-blue-500 hover:bg-blue-700 text-white rounded-lg"} to='/profile'>Voir mon profil</NavLink>
              <NavLink className={"hover:text-red-500"} to='/deconnexion'>Déconnexion</NavLink>
            </>
          ) : (
            <NavLink to='/connexion'>Connexion</NavLink>
          )}
        </nav>
      </div>
      <div className={'sm:hidden flex flex-col ' + (showCollapse ? '' : 'hidden')} onClick={() => setShowCollapse(false)}>
        {isLog ? (
          <>
            <NavLink className='p-3 hover:bg-blue-700 w-fit rounded-lg' to='/profile'>Voir mon profil</NavLink>
            <NavLink className='p-3 hover:bg-red-500 w-fit rounded-lg' to='/deconnexion'>Déconnexion</NavLink>
          </>
        ) : (
          <NavLink className='p-3 hover:bg-white w-fit rounded-lg' to='/connexion'>Connexion</NavLink>
        )}
      </div>
    </header>
  )
}
