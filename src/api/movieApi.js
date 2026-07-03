import axiosInstance from "./axiosInstance"

export const movieApi = {
    // Lấy danh sách phim
    getMovieList: (maNhom = 'GP01') => {
        return axiosInstance.get(`/QuanLyPhim/LayDanhSachPhim?maNhom=${maNhom}`)
    },
    // Lấy chi tiết phim
    getMovieDetail: (maPhim) => {
        return axiosInstance.get(`/QuanLyPhim/LayThongTinPhim?maPhim=${maPhim}`)
    },
     // lấy danh sách banner
    getBanners: () => {
        return axiosInstance.get('/QuanLyPhim/LayDanhSachBanner')
    }
}