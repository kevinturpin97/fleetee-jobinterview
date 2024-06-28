import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api_url } from "../assets/js/constants";
import { useMainContext } from "../contexts/MainContext";
import Loader from "../components/Loader";

export default function Logout() {
    const { setIsLog, token, setToken } = useMainContext();
    const [isLoading, setIsLoading] = useState(true);
    const navigator = useNavigate();

    const handleLogout = async () => {
        if (!token) {
            setIsLog(false);
            setToken(null);

            if (isLoading) {
                setIsLoading(false);
            }

            window.location.href = '/';
            return;
        }

        try {
            const req = await fetch(api_url + '/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                }
            });

            if (req.status === 200) {
                localStorage.removeItem('token');
                setToken(null);
                setIsLog(false);
                window.location.href = '/';

                return;
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        handleLogout();
    }, []);

    if (isLoading) {
        return <Loader />;
    }

    return null;
}
