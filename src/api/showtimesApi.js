import axiosInstance from "./axiosInstance";

export const showtimesApi = {
  // Lấy thông tin lịch chiếu theo hệ thống rạp
  getShowtimesBySystem: (maNhom = "GP01") => {
    return axiosInstance.get(
      `/QuanLyRap/LayThongTinLichChieuHeThongRap?maNhom=${maNhom}`
    );
  },

  // Lấy lịch chiếu của một phim
  getShowtimesByMovie: (maPhim) => {
    return axiosInstance.get(
      `/QuanLyRap/LayThongTinLichChieuPhim?MaPhim=${maPhim}`
    );
  },
};