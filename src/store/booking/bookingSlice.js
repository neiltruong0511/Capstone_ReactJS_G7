import { createSlice } from "@reduxjs/toolkit";
import danhSachGhe from "../../data/danhSachGhe";

const initialState = {
  danhSachGhe,
  gheKhachChon: [],
  thongTinPhim: null, 
};

const bookingSlice = createSlice({
  name: "booking",
  initialState,

  reducers: {
    // chọn / bỏ chọn ghế
    chonGhe: (state, action) => {
      const gheDuocChon = action.payload;

      const index = state.gheKhachChon.findIndex(
        (g) => g.soGhe === gheDuocChon.soGhe
      );

      if (index === -1) {
        state.gheKhachChon.push(gheDuocChon);
      } else {
        state.gheKhachChon.splice(index, 1);
      }
    },

    // hủy ghế
    huyGhe: (state, action) => {
      const soGhe = action.payload;

      state.gheKhachChon = state.gheKhachChon.filter(
        (g) => g.soGhe !== soGhe
      );
    },

    //Load danh sách ghế 
    loadDanhSachGhe: (state, action) => {
      state.danhSachGhe = action.payload;
      state.gheKhachChon = [];
    },

    // đặt vé
    datVe: (state) => {
      state.danhSachGhe.forEach((hang) => {
        hang.danhSachGhe.forEach((ghe) => {
          const daChon = state.gheKhachChon.find(
            (item) => item.soGhe === ghe.soGhe
          );

          if (daChon) {
            ghe.daDat = true;
          }
        });
      });

      state.gheKhachChon = [];
    },

    // 👇 SET THÔNG TIN PHIM + SUẤT CHIẾU
    setThongTinPhim: (state, action) => {
      state.thongTinPhim = action.payload;
    },
  },
});

// actions
export const {
  chonGhe,
  huyGhe,
  datVe,
  setThongTinPhim,
  loadDanhSachGhe,
} = bookingSlice.actions;

// selectors
export const selectorDanhSachGhe = (state) =>
  state.booking.danhSachGhe;

export const selectorGheKhachChon = (state) =>
  state.booking.gheKhachChon;

export const selectorThongTinPhim = (state) =>
  state.booking.thongTinPhim;

export default bookingSlice.reducer;