import { NavLink } from "react-router-dom";

export default function Footer() {
    return (
        <footer className='fixed bottom-0 bg-slate-500 w-full p-4'>
            <div className='text-white flex flex-row justify-between'>
                <nav className='hidden sm:flex flex-row space-x-2 items-center text-sm'>
                    <NavLink to='/'>Accueil</NavLink>
                    <NavLink to='/'>Films</NavLink>
                    <NavLink to='/'>Séries</NavLink>
                </nav>
                <p className='text-sm'>&copy; Pour Fleetee - Job Interview - {new Date().getFullYear()}</p>
            </div>
        </footer>
    )
}