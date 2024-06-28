import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import { useRef, useState } from 'react';
import { api_url, errorTypes } from '../assets/js/constants';
import { useMainContext } from '../contexts/MainContext';

export default function Login() {
  const { setIsLog, setToken } = useMainContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { state } = useLocation();
  const formRef = useRef(null);
  const navigator = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = new FormData(formRef.current);

    setIsLoading(true);

    try {
      const req = await fetch(api_url + '/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: form.get('email'),
          password: form.get('password')
        })
      });

      const res = await req.json();
      
      if (req.status !== 200) {
        // FEATURE: translate error message
        const error = errorTypes.login.find(error => error.message === res.message).translation;

        setError(error || errorTypes.default.translation);
      } else {
        localStorage.setItem('token', res.token);
        setToken(res.token);
        setIsLog(true);
        navigator('/');
      }
    } catch (e) {
      setError(errorTypes.default.translation);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {state && state.alert && <Alert type={state.alert.type} message={state.alert.message} />}
      {error && <Alert type={'error'} message={error} />}
      <div className='self-center my-auto p-4'>
        <h2 className='text-2xl font-bold text-white mb-4 text-center'>Connexion</h2>
        <form ref={formRef} className='bg-slate-600 text-white p-8 rounded shadow-md w-full sm:w-fit pb-4' onSubmit={handleSubmit}>
          <label htmlFor='email' className='block text-sm font-medium leading-6'>Email</label>
          <input type='email' id='email' name='email' className='w-full text-black border border-gray-300 rounded p-2 mb-4' />
          <label htmlFor='password' className='block text-sm font-medium leading-6'>Mot de passe</label>
          <input type='password' id='password' name='password' className='w-full text-black border border-gray-300 rounded p-2 mb-4' />
          <button type='submit' className='w-full bg-slate-900 text-white font-bold p-2 rounded' disabled={isLoading}>
            {isLoading ? 'Chargement...' : 'Se connecter'}
          </button>
          <div className='flex flex-row mt-5 space-x-2'>
            <small className='text-gray-400'>Pas de compte ?</small>
            <NavLink to='/inscription' className={'text-white underline text-sm'}>S'inscrire</NavLink>
          </div>
        </form>
      </div>
    </>
  );
}
