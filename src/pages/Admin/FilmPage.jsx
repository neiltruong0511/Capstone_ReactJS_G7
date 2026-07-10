import React, { useState } from "react";
import { useMovieListPhanTrang, useAddMovie, useDeleteMovie } from "../../hooks/useMovies";
import * as Yup from "yup";
import { useFormik } from "formik";
import LoadingSpinner from "../../components/LoadingSpinner";

// Validation schema cho thêm phim
const addMovieSchema = Yup.object().shape({
  tenPhim: Yup.string().required("Tên phim không được để trống"),
  biDanh: Yup.string().required("Bí danh không được để trống"),
  hinhAnh: Yup.string().required("Hình ảnh không được để trống"),
  moTa: Yup.string()
    .min(10, "Mô tả phải có ít nhất 10 ký tự")
    .required("Mô tả không được để trống"),
  ngayKhoiChieu: Yup.date()
    .typeError("Ngày khởi chiếu phải là ngày hợp lệ")
    .required("Ngày khởi chiếu không được để trống"),
  danhGia: Yup.number()
    .min(0, "Đánh giá phải từ 0 đến 10")
    .max(10, "Đánh giá phải từ 0 đến 10")
    .required("Đánh giá không được để trống"),
});

const FilmPage = () => {
  // BƯỚC 1: Lưu trang hiện tại vào state
  const [currentPage, setCurrentPage] = useState(1);

  // Số phim hiển thị trên mỗi trang
  const PAGE_SIZE = 10;

  // BƯỚC 2: Gọi hook useMovieListPhanTrang
  const { data, isLoading } = useMovieListPhanTrang(currentPage, PAGE_SIZE);

  // BƯỚC 3: Lấy dữ liệu từ response API
  const movies = data?.items || [];
  const totalPages = data?.totalPages || 1;
  const totalCount = data?.totalCount || 0;

  const addMovie = useAddMovie();
  const deleteMovie = useDeleteMovie();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const formik = useFormik({
    initialValues: {
      tenPhim: "",
      biDanh: "",
      hinhAnh: "",
      moTa: "",
      ngayKhoiChieu: "",
      danhGia: 8,
      maNhom: "GP01",
      hot: false,
      sapChieu: false,
    },
    validationSchema: addMovieSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        // Tạo FormData để upload file hình ảnh
        const formData = new FormData();
        formData.append("tenPhim", values.tenPhim);
        formData.append("biDanh", values.biDanh);
        formData.append("moTa", values.moTa);
        formData.append("ngayKhoiChieu", values.ngayKhoiChieu);
        formData.append("danhGia", values.danhGia);
        formData.append("maNhom", values.maNhom);
        formData.append("hot", values.hot);
        formData.append("sapChieu", values.sapChieu);

        // Thêm file hình ảnh nếu có
        if (selectedImage) {
          formData.append("hinhAnh", selectedImage);
        }

        await addMovie.mutateAsync(formData);
        resetForm();
        setSelectedImage(null);
        setImagePreview(null);
        setIsModalOpen(false);
      } catch (error) {
        console.log(error);
        alert("Thêm phim thất bại: " + (error?.response?.data?.message || error.message));
      }
    },
  });

  const handleCloseModal = () => {
    formik.resetForm();
    setSelectedImage(null);
    setImagePreview(null);
    setIsModalOpen(false);
  };

  const handleImageChange = (event) => {
    const file = event.currentTarget.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      formik.setFieldValue("hinhAnh", file.name);
    }
  };

  const handleDeleteMovie = async (maPhim, tenPhim) => {
    if (window.confirm(`Bạn có chắc muốn xóa phim "${tenPhim}"?`)) {
      try {
        await deleteMovie.mutateAsync(maPhim);
        alert("Xóa phim thành công!");
      } catch (error) {
        console.log(error);
        alert("Xóa phim thất bại: " + (error?.response?.data?.message || error.message));
      }
    }
  };

  return (
    <div>
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-950/70 z-50">
          <LoadingSpinner />
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white text-2xl font-bold">
            Danh sách phim
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Trang{" "}
            <span className="text-yellow-400 font-medium">{currentPage}</span> /{" "}
            {totalPages} — Tổng{" "}
            <span className="text-yellow-400 font-medium">{totalCount}</span>{" "}
            phim
          </p>
        </div>
        <div className="relative w-72">
          <input
            type="text"
            placeholder="Tìm theo tên phim..."
            className="w-full bg-gray-800 text-white placeholder-gray-500 border border-gray-700 rounded-xl px-4 py-2.5 pr-10 outline-none focus:ring-2 focus:ring-yellow-400 text-sm transition-all"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
            🔍
          </span>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          Thêm phim
        </button>
      </div>

      {/* Bảng danh sách phim */}
      <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-800/50">
                <th className="text-left text-gray-400 font-medium px-5 py-4 whitespace-nowrap">
                  #
                </th>
                <th className="text-left text-gray-400 font-medium px-5 py-4 whitespace-nowrap">
                  Tên phim
                </th>
                <th className="text-left text-gray-400 font-medium px-5 py-4 whitespace-nowrap">
                  Bí danh
                </th>
                <th className="text-left text-gray-400 font-medium px-5 py-4 whitespace-nowrap">
                  Ngày khởi chiếu
                </th>
                <th className="text-left text-gray-400 font-medium px-5 py-4 whitespace-nowrap">
                  Đánh giá
                </th>
                <th className="text-left text-gray-400 font-medium px-5 py-4 whitespace-nowrap">
                  Trạng thái
                </th>
                <th className="text-left text-gray-400 font-medium px-5 py-4 whitespace-nowrap">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {movies.map((movie, index) => (
                <tr
                  key={movie.maPhim}
                  className="hover:bg-gray-800/50 transition-colors group"
                >
                  <td className="px-5 py-4 text-gray-500">
                    {(currentPage - 1) * PAGE_SIZE + index + 1}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {movie.hinhAnh && (
                        <div className="w-10 h-14 rounded overflow-hidden bg-gray-800 flex-shrink-0">
                          <img
                            src={movie.hinhAnh}
                            alt={movie.tenPhim}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <span className="text-white font-medium max-w-xs truncate">
                        {movie.tenPhim}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-300 truncate">
                    {movie.biDanh}
                  </td>
                  <td className="px-5 py-4 text-gray-300">
                    {new Date(movie.ngayKhoiChieu).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400 font-bold">
                        {movie.danhGia}
                      </span>
                      <span className="text-yellow-400">⭐</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      {movie.hot && (
                        <span className="bg-red-500/15 text-red-400 border border-red-400/30 text-xs font-medium px-2.5 py-1 rounded-full">
                          Hot
                        </span>
                      )}
                      {movie.sapChieu && (
                        <span className="bg-blue-500/15 text-blue-400 border border-blue-400/30 text-xs font-medium px-2.5 py-1 rounded-full">
                          Sắp chiếu
                        </span>
                      )}
                      {!movie.hot && !movie.sapChieu && (
                        <span className="bg-gray-800/50 text-gray-400 border border-gray-700/30 text-xs font-medium px-2.5 py-1 rounded-full">
                          Thường
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors">
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteMovie(movie.maPhim, movie.tenPhim)}
                        className="bg-red-600 hover:bg-red-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Phân trang */}
      <div className="flex items-center justify-center gap-2 mt-6">
        <button
          onClick={() => setCurrentPage((p) => p - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
        >
          ← Trước
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
              page === currentPage
                ? "bg-yellow-400 text-gray-900"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => setCurrentPage((p) => p + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
        >
          Sau →
        </button>
      </div>

      {/* Modal thêm phim */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-800 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800 sticky top-0 bg-gray-900">
              <h3 className="text-white text-lg font-bold">
                Thêm phim mới
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-white transition-colors text-xl leading-none"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={formik.handleSubmit}
              className="px-6 py-5 space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-xs font-medium mb-1.5">
                    Tên phim *
                  </label>
                  <input
                    type="text"
                    {...formik.getFieldProps("tenPhim")}
                    placeholder="Nhập tên phim"
                    className="w-full bg-gray-800 text-white placeholder-gray-500 border border-gray-700 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                  />
                  {formik.touched.tenPhim && formik.errors.tenPhim && (
                    <p className="text-red-500 text-xs mt-1">
                      {formik.errors.tenPhim}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-400 text-xs font-medium mb-1.5">
                    Bí danh *
                  </label>
                  <input
                    type="text"
                    {...formik.getFieldProps("biDanh")}
                    placeholder="Nhập bí danh"
                    className="w-full bg-gray-800 text-white placeholder-gray-500 border border-gray-700 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                  />
                  {formik.touched.biDanh && formik.errors.biDanh && (
                    <p className="text-red-500 text-xs mt-1">
                      {formik.errors.biDanh}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-xs font-medium mb-1.5">
                  Mô tả *
                </label>
                <textarea
                  {...formik.getFieldProps("moTa")}
                  placeholder="Nhập mô tả phim"
                  rows="3"
                  className="w-full bg-gray-800 text-white placeholder-gray-500 border border-gray-700 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-yellow-400 text-sm resize-none"
                />
                {formik.touched.moTa && formik.errors.moTa && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.moTa}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-xs font-medium mb-1.5">
                    Ngày khởi chiếu *
                  </label>
                  <input
                    type="date"
                    {...formik.getFieldProps("ngayKhoiChieu")}
                    className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                  />
                  {formik.touched.ngayKhoiChieu && formik.errors.ngayKhoiChieu && (
                    <p className="text-red-500 text-xs mt-1">
                      {formik.errors.ngayKhoiChieu}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-400 text-xs font-medium mb-1.5">
                    Đánh giá (0-10) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    {...formik.getFieldProps("danhGia")}
                    className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                  />
                  {formik.touched.danhGia && formik.errors.danhGia && (
                    <p className="text-red-500 text-xs mt-1">
                      {formik.errors.danhGia}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-xs font-medium mb-1.5">
                  Hình ảnh *
                </label>
                <div className="flex gap-4">
                  <label className="flex-1 border-2 border-dashed border-gray-700 rounded-lg px-4 py-6 cursor-pointer hover:border-yellow-400/50 transition-colors text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <div className="text-gray-400 text-sm">
                      {imagePreview ? (
                        <span className="text-green-400">✓ Đã chọn hình ảnh</span>
                      ) : (
                        <span>Chọn hình ảnh</span>
                      )}
                    </div>
                  </label>
                  {imagePreview && (
                    <div className="w-20 h-28 rounded bg-gray-800 border border-gray-700 flex-shrink-0 overflow-hidden">
                      <img
                        src={imagePreview}
                        alt="preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
                {formik.touched.hinhAnh && formik.errors.hinhAnh && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.hinhAnh}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...formik.getFieldProps("hot")}
                    className="w-4 h-4 rounded bg-gray-700 border border-gray-600"
                  />
                  <span className="text-gray-300 text-sm">Phim hot</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...formik.getFieldProps("sapChieu")}
                    className="w-4 h-4 rounded bg-gray-700 border border-gray-600"
                  />
                  <span className="text-gray-300 text-sm">Sắp chiếu</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!formik.isValid || addMovie.isPending}
                  className="bg-yellow-400 hover:bg-yellow-500 disabled:bg-yellow-700 text-gray-900 font-bold px-5 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-2"
                >
                  {addMovie.isPending ? "Đang thêm..." : "Thêm phim"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilmPage;
