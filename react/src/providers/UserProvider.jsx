import { useEffect, useState } from "react";
import { useMainContext } from "../contexts/MainContext";
import { api_url } from "../assets/js/constants";
import { UserContext } from "../contexts/UserContext";
import Alert from "../components/Alert";

/**
 *  user provider usage :
 * - avoid to call api multiple times (!re-render)
 * - provide common user functions to children
 * - provide common data to children
 */
export default function UserProvider({ children }) {
    const { token } = useMainContext();
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({});
    const [films, setFilms] = useState([]);
    const [tvShows, setTVShows] = useState([]);
    const [error, setError] = useState(null);

    const getStats = async () => {
        try {
            const req = await fetch(api_url + '/user/profile', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                }
            });

            const res = await req.json();

            if (req.status === 200) {
                setStats(res);
            }
        } catch (e) {
            console.error(e);
        }
    }

    const getUserFilms = async () => {
        try {
            const req = await fetch(api_url + '/user/film', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                }
            });

            const res = await req.json();

            if (req.status === 200) {
                setFilms(res);
            }
        } catch (e) {
            console.error(e);
        }
    }

    const getUserTVShows = async () => {
        try {
            const req = await fetch(api_url + '/user/tv', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                }
            });

            const res = await req.json();

            if (req.status === 200) {
                setTVShows(res);
            }
        } catch (e) {
            console.error(e);
        }
    }

    const addUserFilm = async (tmdbId) => {
        try {
            const req = await fetch(api_url + '/user/film', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({ id: tmdbId })
            });

            if (req.status === 201) {
                await getUserFilms();
                await getStats();
            } else {
                setError('Ce film introuvable ou déjà dans votre liste');
            }
        } catch (e) {
            console.error(e);
        }
    }

    const addUserTVShow = async (tmdbId) => {
        try {
            const req = await fetch(api_url + '/user/tv', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({ id: tmdbId, season: 1, episode: 1 })
            });

            if (req.status === 201) {
                await getUserTVShows();
                await getStats();
            } else {
                setError('Cette série/émission est introuvable ou déjà dans votre liste');
            }
        } catch (e) {
            console.error(e);
        }
    }

    const removeUserFilm = async (id) => {
        try {
            const req = await fetch(api_url + '/user/film', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({ id: id })
            });

            if (req.status === 204) {
                await getUserFilms();
                await getStats();
            }
        } catch (e) {
            console.error(e);
        }
    }

    const removeUserTVShow = async (id) => {
        try {
            const req = await fetch(api_url + '/user/tv', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({ id: id })
            });

            if (req.status === 204) {
                await getUserTVShows();
                await getStats();

            }
        } catch (e) {
            console.error(e);
        }
    }

    const updateTVShow = async (id, saisonXEpisode) => {
        const [season, episode] = saisonXEpisode.split('x').map((v) => parseInt(v));

        try {
            const req = await fetch(api_url + '/user/tv', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({ id: id, episode: episode, season: season })
            });

            if (req.status === 200) {
                await getUserTVShows();
                await getStats();
            }
        } catch (e) {
            console.error(e);
        }
    }

    const refresh = async () => {
        setIsLoading(true);
        await getStats();
        await getUserFilms();
        await getUserTVShows();
        setIsLoading(false);
    }

    useEffect(() => {
        (async () => {
            await getUserFilms();
            await getUserTVShows();
            await getStats();
            setIsLoading(false);
        })();
    }, []);

    useEffect(() => {
        if (error) {
            const delay = setTimeout(() => {
                setError(null);
            }, 2500);

            return () => clearTimeout(delay);
        }
    }, [error]);

    return (
        <UserContext.Provider value={{
            stats,
            films,
            tvShows,
            isLoading,
            addUserFilm,
            addUserTVShow,
            removeUserFilm,
            removeUserTVShow,
            updateTVShow,
            refresh
        }}>
            {isLoading ? (
                <span className='block text-white text-center my-auto'>Chargement des vos données en cours...</span>
            ) : (
                <>
                    {error && <Alert type='error' message={error} />}
                    {children}
                </>
            )}
        </UserContext.Provider>
    );
}
