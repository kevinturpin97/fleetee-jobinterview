import { useEffect, useState } from "react";
import { Card } from "../../components/Card";
import UserStats from "../../components/UserStats";
import { useUserContext } from "../../contexts/UserContext";
import { api_url } from "../../assets/js/constants";
import ModalAddToList from "../../components/ModalAddToList";
import ModalTVShowDetail from "../../components/ModalTVShowDetail";

export default function UserProfile() {
  const {
    stats,
    films,
    tvShows,
    addUserFilm,
    addUserTVShow,
    removeUserFilm,
    removeUserTVShow,
    updateTVShow,
    refresh
  } = useUserContext();
  const [modalFilm, setModalFilm] = useState(false);
  const [modalTVShow, setModalTVShow] = useState(false);
  const [modalTVShowDetail, setModalTVShowDetail] = useState(false);
  const [selectedTVShow, setSelectedTVShow] = useState(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);

  const handleSearch = async () => {
    if (!query) {
      return;
    }

    try {
      const req = await fetch(api_url + '/' + (modalFilm ? 'film' : 'tv') + '/search?query=' + encodeURIComponent(query), {
        method: 'GET'
      });

      if (req.status === 200) {
        const res = await req.json();

        setResults(res);
      }
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    if (!query) { return; }

    const delay = setTimeout(() => {
      handleSearch();
    }, 1500);

    return () => clearTimeout(delay);
  }, [query]);

  useEffect(() => {
    if (modalFilm || modalTVShow) { return; }

    setQuery('');
  }, [modalFilm, modalTVShow]);

  useEffect(() => {
    if (selectedTVShow) {
      setModalTVShowDetail(true);
    }
  }, [selectedTVShow]);

  return (
    <div className='flex flex-col h-auto w-11/12 p-3 mx-auto'>
      <h2 className='text-2xl font-bold text-white mb-4 text-center'>Mon profil</h2>
      <div className="flex flex-col items-center justify-center">
        <img src={'https://placehold.co/150x150'} alt={'profile-picture'} className="w-24 h-24 rounded-full mb-2" />

        <div className="flex flex-col justify-center w-full space-y-3 mt-5 md:w-3/4 lg:w-2/3">
          <h3 className="text-lg font-bold text-white">Mes statistiques</h3>
          <UserStats stats={stats} />
        </div>

        <div className="flex flex-col w-full">
          <h3 className="text-2xl font-bold text-white mb-4 mt-8">Vos films</h3>
          <div className="flex flex-row my-2">
            <button className="bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-700" onClick={() => setModalFilm(true)}>Ajouter un film</button>
          </div>
          <div className="grid gird-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {films.length > 0 ? films.map((film, index) => (
              <div key={index} className="flex flex-col">
                <Card data={film} userData={true} />
                <button className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-700 mt-2 w-fit" onClick={() => removeUserFilm(film.id)}>Supprimer</button>
              </div>
            )) :
              (<p className="text-white">Aucun film ajouté</p>)
            }
          </div>
        </div>

        <div className="flex flex-col w-full">
          <h3 className="text-2xl font-bold text-white mb-4 mt-8">Vos séries et émissions</h3>
          <div className="flex flex-row my-2">
            <button className="bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-700" onClick={() => setModalTVShow(true)}>Ajouter une série ou une émission</button>
          </div>
          <div className="grid gird-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {tvShows.length > 0 ? tvShows.map((tvShow, index) => (
              <div key={index} className="flex flex-col">
                <Card key={index} data={tvShow} userData={true} />
                <div className="flex flex-row justify-between items-center mt-2">
                  <button className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-700" onClick={() => removeUserTVShow(tvShow.id)}>Supprimer</button>
                  <button className="bg-amber-500 text-white px-4 py-2 rounded-md hover:bg-amber-700" onClick={() => setSelectedTVShow(tvShow.id)}>Modifier la progression</button>
                </div>
              </div>
            )) :
              (<p className="text-white">Aucune série ou émission ajoutée</p>)
            }
          </div>
        </div>
      </div>

      <ModalAddToList
        isOpen={modalFilm || modalTVShow}
        onClose={() => {
          if (modalFilm) {
            setModalFilm(false);
          } else {
            setModalTVShow(false);
          }

          setResults(null);
        }}
        isFilm={modalFilm}
        results={results}
        addToList={async (id, season, episode) => modalFilm ? await addUserFilm(id) : await addUserTVShow(id, season, episode)}
        setQuery={setQuery}
      />
      <ModalTVShowDetail
        isOpen={modalTVShowDetail}
        onClose={() => {
          setModalTVShowDetail(false);
          setSelectedTVShow(null);
        }}
        tvShowId={selectedTVShow}
        updateTVShow={updateTVShow}
      />
    </div>
  );
}