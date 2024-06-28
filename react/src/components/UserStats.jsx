export default function UserStats({ stats }) {
    return (
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center sm:w-full bg-slate-800 p-3 rounded-lg space-y-5 sm:space-y-0">
            <div className="flex flex-col items-start justify-center">
                <h4 className="font-semibold text-white">Au total : </h4>
                <span className="text-slate-300">Film(s) ajouté(s): <span className="text-white">{stats.total_films}</span></span>
                <span className="text-slate-300">Série(s) ajoutée(s): <span className="text-white">{stats.total_tv_shows}</span></span>
                <span className="text-slate-300">Temps total: <span className="text-white">{stats.total_hours}h{stats.total_minutes < 10 ? '0' + stats.total_minutes : stats.total_minutes}</span></span>
            </div>
            <div className="flex flex-col items-start justify-center">
                <h4 className="font-semibold text-white">Si on devait convertir...</h4>
                <span className="text-slate-300">Lecture: <span className="text-white">{stats.convert_book_reading}</span> livre(s) de 300 pages lu(s)</span>
                <span className="text-slate-300">Sport: <span className="text-white">{stats.convert_sport}</span> séance(s) de sport (1h en moyenne)</span>
            </div>
        </div>
    );
}
