import { useEffect, useState } from "react";
import Loader from "./Loader";
import Modal from "./Modal";
import { api_url } from "../assets/js/constants";
import { useMainContext } from "../contexts/MainContext";

export default function ModalTVShowDetail({ isOpen, onClose, tvShowId, updateTVShow }) {
    const { token } = useMainContext();
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState(null);

    const getTVShow = async () => {
        try {
            const req = await fetch(api_url + '/tv/' + tvShowId, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                }
            });

            if (req.status === 200) {
                const res = await req.json();

                setData(res);
            }
        } catch (e) {
            console.error(e);
            onClose();
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (!isOpen) { return; }
        
        getTVShow();
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    return (
        <Modal isOpen={isOpen} close={onClose}>
            {isLoading ? (<Loader />) : (
                <div className="flex flex-col bg-slate-900 p-3 rounded-md w-11/12 sm:w-3/4 md:w-2/3 lg:w-1/2">
                    <h2 className="text-2xl font-bold text-white mb-4 text-center">Indiquez votre avancement</h2>
                    <img src={"https://image.tmdb.org/t/p/w500" + data.thumbnail} alt={data.name} className="w-64 h-64 rounded-md object-contain mx-auto" />
                    <h3 className="text-white text-center text-xl font-semibold my-2">{data.name}</h3>
                    <select className="w-1/2 mx-auto p-2 rounded-md mb-4" onChange={(e) => {
                        updateTVShow(tvShowId, e.target.value);
                        onClose();
                    }}>
                        {Array.from({ length: data.seasons }).map((_, sIndex) => (
                            <optgroup key={sIndex} label={"Saison " + (sIndex + 1)}>
                                {Array.from({ length: data.episodes }).map((_, eIndex) => (
                                    <option key={eIndex} value={(sIndex + 1) + 'x' + (eIndex + 1)}>Episode {eIndex + 1}</option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
                </div>
            )}
        </Modal>
    );
}
