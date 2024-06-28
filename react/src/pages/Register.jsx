import { useEffect, useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom';
import { api_url, errorTypes } from '../assets/js/constants';
import Alert from '../components/Alert';

export default function Register() {
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const formRef = useRef(null);
  const navigator = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = new FormData(formRef.current);

    if (form.get('password') !== form.get('confirm-password')) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setIsLoading(true);

    try {
      const req = await fetch(api_url + '/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: form.get('email'),
          password: form.get('password'),
          confirm_password: form.get('confirm-password')
        })
      });

      const res = await req.json();

      if (req.status !== 201) {
        const error = errorTypes.register.find(error => error.message === res.message).translation;

        setError(error || errorTypes.default.translation);
      } else {
        navigator('/connexion', { state: { alert: { type: 'success', message: 'Inscription réussie, vous pouvez maintenant vous connecter' } } });

        return;
      }
    } catch (e) {
      setError(errorTypes.default.translation);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {error && <Alert type={'error'} message={error} />}
      <div className='self-center my-auto'>
        <h2 className='text-2xl font-bold text-white mb-4 text-center'>Inscription</h2>
        <form ref={formRef} className='bg-slate-600 text-white p-8 rounded shadow-md w-full sm:w-fit pb-4' onSubmit={handleSubmit}>
          <label htmlFor='email' className='block text-sm font-medium leading-6'>Email</label>
          <input type='email' id='email' name='email' className='w-full text-black border border-gray-300 rounded p-2 mb-4' required />
          <label htmlFor='password' className='block text-sm font-medium leading-6'>Mot de passe</label>
          <input type='password' id='password' name='password' className='w-full text-black border border-gray-300 rounded p-2 mb-4' required />
          <label htmlFor='confirm-password' className='block text-sm font-medium leading-6'>Confirmer le mot de passe</label>
          <input type='password' id='confirm-password' name='confirm-password' className='w-full text-black border border-gray-300 rounded p-2 mb-4' required />
          <button type='submit' className='w-full bg-slate-900 text-white font-bold p-2 rounded' disabled={isLoading}>S'inscrire</button>
          <div className='flex flex-row mt-5 space-x-2'>
            <small className='text-gray-400'>Déjà un compte ?</small>
            <NavLink to='/connexion' className={'text-white underline text-sm'}>Se connecter</NavLink>
          </div>
        </form>
      </div>
    </>
  );
}
