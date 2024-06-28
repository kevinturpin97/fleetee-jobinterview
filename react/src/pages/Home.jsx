import { useEffect, useState } from "react";
import { Card, CardSkeleton } from "../components/Card";
import { api_url } from "../assets/js/constants";

export default function HomePage() {
  const [films, setFilms] = useState([]);
  const [tvShows, setTvShows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const getFilms = async () => {
    try {
      const req = await fetch(api_url + '/film', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
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

  const getTvShows = async () => {
    try {
      const req = await fetch(api_url + '/tv', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const res = await req.json();

      if (req.status === 200) {
        setTvShows(res);
      }
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    (async () => {
      await getFilms();
      await getTvShows();
      setIsLoading(false);
    })();
  }, []);

  return (
    <>
      <div className='w-full'>
        {/* <iframe width="960" height="540" src="https://www.youtube.com/watch?v=aznxojO15M0?autoplay=1&mute=1&controls=0&rel=0&loop=1&modestbranding=1&showinfo=0&cc_load_policy=0&autohide=1" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen className='w-full h-52'></iframe> */}
      </div>
      <h2 className='text-4xl font-bold text-white text-center'>Un site pour suivre <span className="underline">vos films et séries</span></h2>
      <div className="w-full flex flex-col p-4">
        <h3 className="text-2xl font-bold text-white mb-4 mt-8">Les films à l'affiche</h3>
        <div className="grid gird-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {(isLoading || films.length === 0) ? Array.from({ length: 5 }).map((_, index) => <CardSkeleton key={index} />) : films.map((movie, index) => <Card key={index} data={movie} />)}
        </div>
        <h3 className="text-2xl font-bold text-white mb-4 mt-8">Les émissions à venir</h3>
        <div className="grid gird-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {(isLoading || tvShows.length === 0) ? Array.from({ length: 5 }).map((_, index) => <CardSkeleton key={index} />) : tvShows.map((tvShow, index) => <Card key={index} data={tvShow} />)}
        </div>
      </div>
    </>
  );
}
