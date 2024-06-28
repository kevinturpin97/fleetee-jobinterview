export default function Loader() {
  return (
    <div className='w-full h-screen flex flex-row justify-center items-center'>
        <div className='w-16 h-16 border-4 border-t-4 border-gray-200 rounded-full relative'>
            <div className='animate-spin absolute h-full w-full bg-transparent rounded-full border-t-4 border-gray-400'></div>
        </div>
        <p className='text-gray-700 text-2xl font-semibold ml-4'>Chargement en cours...</p>
    </div>
  );
}
