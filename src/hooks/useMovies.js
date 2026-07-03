// custom hook để lấy danh sách phim

import { useQuery } from "@tanstack/react-query"
import { movieApi } from "../api/movieApi"

export const useMovieList = (maNhom = 'GP01') => {
    return useQuery({
        // queryKey: định danh duy nhất để lưu trong cache
        queryKey: ['movieList', maNhom],
        // queryFn: hàm thực hiện gọi API để lấy dữ liệ
        queryFn: async () => {
            const response = await movieApi.getMovieList(maNhom)
            return response.data.content
        }
    })
}

export const useMovieDetail = (maPhim) => {
    return useQuery({
        queryKey: ['movieDetail', maPhim],
        queryFn: async () => {
            const response = await movieApi.getMovieDetail(maPhim)
            return response.data.content
        },
        enabled: maPhim !== undefined && maPhim !== null && maPhim !== "" // chỉ gọi API khi maPhim có giá trị hợp lệ
    })
}