import React, { useState } from "react";
import { useAddUser, useUsers } from "../../hooks/useUser";
import * as Yup from "yup";
import { useFormik } from "formik";
import LoadingSpinner from "../../components/LoadingSpinner";

const addUserSchema = Yup.object().shape({
  taiKhoan: Yup.string().required("Tài khoản không được để trống"),
  matKhau: Yup.string()
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .required("Mật khẩu không được để trống"),
  email: Yup.string()
    .email("Email không hợp lệ")
    .required("Email không được để trống"),
  soDt: Yup.string().required("Số điện thoại không được để trống"),
  hoTen: Yup.string().required("Họ tên không được để trống"),
  maLoaiNguoiDung: Yup.string().required("Loại người dùng không được để trống"),
});

const UserPage = () => {
  // BƯỚC 1: Lưu trang hiện tại vào state, mặc định là trang 1
  // Mỗi khi currentPage thay đổi → React re-render → useUsers gọi lại API trang mới
  const [currentPage, setCurrentPage] = useState(1);

  // Số người dùng hiển thị trên mỗi trang (cố định là 10)
  const PAGE_SIZE = 10;

  // BƯỚC 2: Gọi hook useUsers, truyền vào trang hiện tại và số phần tử mỗi trang
  // Hook này sẽ gọi API: /LayDanhSachNguoiDungPhanTrang?MaNhom=GP01&soTrang=1&soPhanTuTrenTrang=10
  // Khi currentPage thay đổi → queryKey thay đổi → TanStack Query tự động gọi lại API
  const { data, isLoading } = useUsers(currentPage, PAGE_SIZE);

  // BƯỚC 3: Lấy dữ liệu từ response API trả về
  // data.items       = mảng người dùng của trang hiện tại (tối đa 10 người)
  // data.totalPages  = tổng số trang (ví dụ: 120 người / 10 = 12 trang)
  // data.totalCount  = tổng số người dùng trong hệ thống (ví dụ: 120)
  const users = data?.items || []; // nếu chưa có data thì dùng mảng rỗng
  const totalPages = data?.totalPages || 1; // nếu chưa có data thì mặc định 1 trang
  const totalCount = data?.totalCount || 0; // nếu chưa có data thì mặc định 0

  const addUser = useAddUser();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formik = useFormik({
    initialValues: {
      taiKhoan: "",
      matKhau: "",
      email: "",
      soDt: "",
      hoTen: "",
      maLoaiNguoiDung: "KhachHang",
      maNhom: "GP01",
    },
    validationSchema: addUserSchema,
    onSubmit: async (values, { resetForm }) => {
      // reset form sau khi submit thành công
      try {
        await addUser.mutateAsync(values);
        resetForm();
        setIsModalOpen(false);
      } catch (error) {
        console.log(error);
      }
    },
  });

  const handleCloseModal = () => {
    formik.resetForm();
    setIsModalOpen(false);
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
            Danh sách người dùng
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Trang{" "}
            <span className="text-yellow-400 font-medium">{currentPage}</span> /{" "}
            {totalPages} — Tổng{" "}
            <span className="text-yellow-400 font-medium">{totalCount}</span>{" "}
            người dùng
          </p>
        </div>
        <div className="relative w-72">
          <input
            type="text"
            placeholder="Tìm theo tên, tài khoản, email..."
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
          Thêm người dùng
        </button>
      </div>
      <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-800/50">
                <th className="text-left text-gray-400 font-medium px-5 py-4 whitespace-nowrap">
                  #
                </th>
                <th className="text-left text-gray-400 font-medium px-5 py-4 whitespace-nowrap">
                  Tài khoản
                </th>
                <th className="text-left text-gray-400 font-medium px-5 py-4 whitespace-nowrap">
                  Họ tên
                </th>
                <th className="text-left text-gray-400 font-medium px-5 py-4 whitespace-nowrap">
                  Email
                </th>
                <th className="text-left text-gray-400 font-medium px-5 py-4 whitespace-nowrap">
                  Số điện thoại
                </th>
                <th className="text-left text-gray-400 font-medium px-5 py-4 whitespace-nowrap">
                  Loại tài khoản
                </th>
                <th className="text-left text-gray-400 font-medium px-5 py-4 whitespace-nowrap">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {users.map((user, index) => (
                <tr
                  key={user.taiKhoan}
                  className="hover:bg-gray-800/50 transition-colors group"
                >
                  <td className="px-5 py-4 text-gray-500">{index + 1}</td>
                  <td className="px-5 py-4">
                    <span className="text-white font-medium">
                      {user.taiKhoan}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-yellow-400/20 border border-yellow-400/30 flex items-center justify-center text-yellow-400 font-bold text-xs flex-shrink-0">
                        {user.hoTen?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-white">{user.hoTen}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-300">{user.email}</td>
                  <td className="px-5 py-4 text-gray-300">{user.soDT}</td>
                  <td className="px-5 py-4">
                    {user.maLoaiNguoiDung === "KhachHang" ? (
                      <span className="bg-gray-800/50 text-gray-400 border border-gray-700/30 text-xs font-medium px-2.5 py-1 rounded-full">
                        Khách hàng
                      </span>
                    ) : (
                      <span className="bg-yellow-400/15 text-yellow-400 border border-yellow-400/30 text-xs font-medium px-2.5 py-1 rounded-full">
                        Quản trị
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors">
                        Sửa
                      </button>
                      <button className="bg-red-600 hover:bg-red-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors">
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
        {/* 
    Previous button
    - Khi click sẽ giảm currentPage đi 1.
    - Nút sẽ bị disable nếu đang ở trang đầu tiên (currentPage === 1)
      để tránh chuyển sang trang không tồn tại.
  */}
        <button
          onClick={() => setCurrentPage((p) => p - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
        >
          ← Trước
        </button>

        {/*
    Generate page number buttons.
    - Array.from({ length: totalPages }) tạo ra một mảng có số phần tử
      bằng tổng số trang.
    - (_, i) => i + 1 chuyển index (0,1,2,...) thành số trang (1,2,3,...).
    - map() dùng để render một button cho mỗi trang.
  */}
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            /*
              Highlight trang hiện tại.
              - Nếu page === currentPage:
                  + Đổi màu nền để người dùng biết đang ở trang nào.
              - Ngược lại:
                  + Hiển thị màu mặc định và hiệu ứng hover.
            */
            className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
              page === currentPage
                ? "bg-yellow-400 text-gray-900"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            {page}
          </button>
        ))}

        {/*
    Next button
    - Khi click sẽ tăng currentPage lên 1.
    - Disable khi đã ở trang cuối (currentPage === totalPages)
      để tránh vượt quá số trang.
  */}
        <button
          onClick={() => setCurrentPage((p) => p + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
        >
          Sau →
        </button>
      </div>

      {/* modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-800 w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
              <h3 className="text-white text-lg font-bold">
                Thêm người dùng mới
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
                    Tài khoản
                  </label>
                  <input
                    type="text"
                    {...formik.getFieldProps("taiKhoan")}
                    placeholder="Nhập tài khoản"
                    className="w-full bg-gray-800 text-white placeholder-gray-500 border border-gray-700 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                  />
                  {formik.touched.taiKhoan && formik.errors.taiKhoan && (
                    <p className="text-red-500 text-xs mt-1">
                      {formik.errors.taiKhoan}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-400 text-xs font-medium mb-1.5">
                    Mật khẩu
                  </label>
                  <input
                    type="password"
                    {...formik.getFieldProps("matKhau")}
                    placeholder="••••••••"
                    className="w-full bg-gray-800 text-white placeholder-gray-500 border border-gray-700 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                  />
                  {formik.touched.matKhau && formik.errors.matKhau && (
                    <p className="text-red-500 text-xs mt-1">
                      {formik.errors.matKhau}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-xs font-medium mb-1.5">
                  Họ tên
                </label>
                <input
                  type="text"
                  {...formik.getFieldProps("hoTen")}
                  placeholder="Nhập họ tên"
                  className="w-full bg-gray-800 text-white placeholder-gray-500 border border-gray-700 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                />
                {formik.touched.hoTen && formik.errors.hoTen && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.hoTen}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-gray-400 text-xs font-medium mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  {...formik.getFieldProps("email")}
                  placeholder="example@email.com"
                  className="w-full bg-gray-800 text-white placeholder-gray-500 border border-gray-700 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                />
                {formik.touched.email && formik.errors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.email}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-xs font-medium mb-1.5">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    {...formik.getFieldProps("soDt")}
                    placeholder="0901234567"
                    className="w-full bg-gray-800 text-white placeholder-gray-500 border border-gray-700 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                  />
                  {formik.touched.soDt && formik.errors.soDt && (
                    <p className="text-red-500 text-xs mt-1">
                      {formik.errors.soDt}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-400 text-xs font-medium mb-1.5">
                    Loại tài khoản
                  </label>
                  <select
                    {...formik.getFieldProps("maLoaiNguoiDung")}
                    className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                  >
                    <option value="KhachHang">Khách hàng</option>
                    <option value="QuanTri">Quản trị</option>
                  </select>
                  {formik.touched.maLoaiNguoiDung &&
                    formik.errors.maLoaiNguoiDung && (
                      <p className="text-red-500 text-xs mt-1">
                        {formik.errors.maLoaiNguoiDung}
                      </p>
                    )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!formik.isValid}
                  className="bg-yellow-400 hover:bg-yellow-500 disabled:bg-yellow-700 text-gray-900 font-bold px-5 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-2"
                >
                  Thêm người dùng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPage;
