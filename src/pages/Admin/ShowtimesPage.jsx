import { useEffect, useMemo, useState } from "react";
import { showtimesApi } from "../../api/showtimesApi";

const MOVIES_PER_PAGE = 4;

const ShowtimesPage = () => {
  const [systems, setSystems] = useState([]);
  const [selectedSystem, setSelectedSystem] = useState(null);
  const [selectedCinema, setSelectedCinema] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShowtimes();
  }, []);

  const fetchShowtimes = async () => {
    try {
      const res = await showtimesApi.getShowtimesBySystem("GP01");
      const data = res.data.content;

      setSystems(data);

      if (data.length > 0) {
        setSelectedSystem(data[0]);
        setSelectedCinema(data[0].lstCumRap?.[0] || null);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const movies = selectedCinema?.danhSachPhim || [];
  const totalPages = Math.ceil(movies.length / MOVIES_PER_PAGE);

  const currentMovies = useMemo(() => {
    const start = (currentPage - 1) * MOVIES_PER_PAGE;
    return movies.slice(start, start + MOVIES_PER_PAGE);
  }, [movies, currentPage]);

  if (loading)
    return <div className="text-center py-20 text-white">Loading...</div>;

  return (
    <div className="p-8 text-white overflow-x-hidden">
      <h1 className="text-3xl font-bold mb-6">Quản lý lịch chiếu</h1>

      <div className="grid grid-cols-12 gap-6">
        {/* LEFT */}
        <div className="col-span-3 bg-gray-900 rounded-xl overflow-hidden">
          {systems.map((system) => (
            <div
              key={system.maHeThongRap}
              onClick={() => {
                setSelectedSystem(system);
                setSelectedCinema(system.lstCumRap?.[0] || null);
                setCurrentPage(1);
              }}
              className={`p-4 cursor-pointer flex gap-3 items-center border-b border-gray-700 transition ${
                selectedSystem?.maHeThongRap === system.maHeThongRap
                  ? "bg-red-600"
                  : "hover:bg-gray-800"
              }`}
            >
              <img src={system.logo} className="w-12 h-12 object-contain" />
              <p className="font-medium text-sm">{system.tenHeThongRap}</p>
            </div>
          ))}
        </div>

        {/* RIGHT */}
        <div className="col-span-9">
          {/* SELECT CINEMA */}
          <select
            value={selectedCinema?.maCumRap || ""}
            onChange={(e) => {
              const cinema = selectedSystem.lstCumRap.find(
                (c) => c.maCumRap === e.target.value,
              );
              setSelectedCinema(cinema);
              setCurrentPage(1);
            }}
            className="bg-gray-900 rounded px-4 py-2 mb-6 w-full sm:w-auto"
          >
            {selectedSystem.lstCumRap.map((cinema) => (
              <option key={cinema.maCumRap} value={cinema.maCumRap}>
                {cinema.tenCumRap}
              </option>
            ))}
          </select>

          {/* MOVIES */}
          <div className="space-y-5">
            {currentMovies.map((movie) => (
              <div
                key={movie.maPhim}
                className="bg-gray-900 rounded-xl p-4 flex gap-5 w-full overflow-hidden"
              >
                <img
                  src={movie.hinhAnh}
                  className="w-24 sm:w-28 h-36 sm:h-40 rounded object-cover flex-shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold truncate">
                    {movie.tenPhim}
                  </h2>

                  <div className="my-2 flex gap-2 flex-wrap">
                    {movie.hot && (
                      <span className="bg-red-600 px-2 py-1 text-xs rounded">
                        HOT
                      </span>
                    )}
                    {movie.dangChieu && (
                      <span className="bg-green-600 px-2 py-1 text-xs rounded">
                        Đang chiếu
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {movie.lstLichChieuTheoPhim.map((show) => (
                      <button
                        key={show.maLichChieu}
                        className="bg-red-500 hover:bg-red-600 rounded px-2 py-1 text-xs whitespace-nowrap"
                      >
                        {new Date(show.ngayChieuGioChieu).toLocaleString(
                          "vi-VN",
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* PAGINATION FIXED */}
          <div className="flex justify-center mt-8">
            <div className="flex items-center gap-2 flex-wrap justify-center max-w-full">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-3 py-1 bg-gray-700 rounded disabled:opacity-40"
              >
                Prev
              </button>

              {Array.from({ length: totalPages })
                .slice(0, 10)
                .map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPage(index + 1)}
                    className={`w-9 h-9 text-sm rounded-full ${
                      currentPage === index + 1 ? "bg-red-600" : "bg-gray-700"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3 py-1 bg-gray-700 rounded disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowtimesPage;
