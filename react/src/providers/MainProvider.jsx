import { RouterProvider } from "react-router-dom";
import { publicRoutes, privateRoutes } from "../Routes";
import Loader from "../components/Loader";
import { Suspense, useEffect, useState } from "react";
import { MainContext } from "../contexts/MainContext";
import { createBrowserRouter } from "react-router-dom";
import { api_url } from "../assets/js/constants";

/**
 *  main provider usage :
 * - check if user is logged in
 * - provide the main router
 * - provide user state to children
 */
export default function MainProvider() {
    const [isLoading, setIsLoading] = useState(true);
    const [isLog, setIsLog] = useState(false);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [router, setRouter] = useState(null);

    const checkToken = async () => {
        if (!token) {
            setIsLog(false);

            if (isLoading) {
                setIsLoading(false);
            }

            return;
        }

        try {
            const req = await fetch(api_url + '/', {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });

            if (req.status !== 200) {
                localStorage.removeItem('token');
                setToken(null);
                setIsLog(false);
                window.location.href = '/';
            } else {
                setIsLog(true);
            }
        } catch (e) {
            console.error(e);

            // mean that token has been expired
            // remove token and force refresh
            setToken(null);
            localStorage.removeItem('token');
            setIsLog(false);
            window.location.href = '/';
        } finally {
            if (isLoading) {
                setIsLoading(false);
            }
        }
    }

    useEffect(() => {
        (async () => await checkToken())();
        
        const delay = setInterval(() => {
            (async () => await checkToken())();
        }, 1000 * 15); // 15 seconds

        return () => clearInterval(delay)
    }, []);

    useEffect(() => {
        setRouter(createBrowserRouter(isLog ? privateRoutes() : publicRoutes));
    }, [isLog]);

    if (isLoading) {
        return (<Loader />);
    }

    return (
        <MainContext.Provider value={{ isLog, setIsLog, token, setToken }}>
            <Suspense fallback={<Loader />}>
                <RouterProvider
                    router={router}
                    fallbackElement={<Loader />}
                />
            </Suspense>
        </MainContext.Provider>
    );
}