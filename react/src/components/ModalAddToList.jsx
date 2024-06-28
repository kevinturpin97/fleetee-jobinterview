import { useEffect, useRef } from "react";
import Modal from "./Modal";

export default function ModalAddToList({ isOpen, onClose, results, isFilm, addToList, setQuery }) {
    const searchRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            searchRef.current.focus();
        }
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    return (
        <Modal isOpen={isOpen} close={onClose}>
            <div className="flex flex-col bg-slate-900 p-3 rounded-md w-11/12 sm:w-3/4 md:w-2/3 lg:w-1/2">
                <h2 className="text-2xl font-bold text-white mb-4 text-center">Rechercher {isFilm ? 'le film' : 'la série ou l\'émission'} à ajouter</h2>
                <input ref={searchRef} type="text" placeholder="Shrek, Friends, Batman, Twilight..." className="w-full p-2 rounded-md mb-4 md:w-1/2 mx-auto" onInput={(e) => setQuery(e.target.value)} />
                {results !== null && (results.length > 0 ? (
                    <div className="flex flex-col w-full space-y-2 h-64 overflow-y-scroll p-4 my-2">
                        {results.map((result, index) => (
                            <div key={index} className="flex flex-row items-center bg-slate-800 p-2 rounded-md">
                                <img src={"https://image.tmdb.org/t/p/w500" + result.thumbnail} alt={result.name} className="w-10 h-10 sm:w-12 sm:h-12 md:w-24 md:h-24 rounded-md object-contain" />
                                <div className="flex flex-col ml-2 text-white">
                                    <span className="font-semibold">{result.name}</span>
                                    <p className="text-sm line-clamp-2">{result.overview}</p>
                                </div>
                                <button className="bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-700 ml-auto" onClick={async () => {
                                    await addToList(result.id);
                                    onClose();
                                }}>Ajouter</button>
                            </div>
                        ))}
                    </div>
                ) : (<p className="text-white text-center my-2 p-4">Aucun résultat</p>)
                )}
                <button className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-700 w-fit mt-auto" onClick={() => {
                    onClose();
                }}>Fermer</button>
            </div>
        </Modal>
    );
}
