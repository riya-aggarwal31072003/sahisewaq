import { Server } from "socket.io";
import mongoose from "mongoose";
import { isValidDate, todayIST } from "./utils/time.js";

let io;

export const room = (serviceId, date) => `queue:${serviceId}:${date}`;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(",") : "*" },
  });

  io.on("connection", (socket) => {
    // Client asks to follow one service's queue for one date
    socket.on("join", ({ serviceId, date } = {}) => {
      if (!mongoose.isValidObjectId(serviceId)) return;
      socket.join(room(serviceId, isValidDate(date) ? date : todayIST()));
    });

    socket.on("leave", ({ serviceId, date } = {}) => {
      if (!mongoose.isValidObjectId(serviceId)) return;
      socket.leave(room(serviceId, isValidDate(date) ? date : todayIST()));
    });
  });

  return io;
};

// Tells everyone following this queue that something changed
export const emitQueueUpdate = (serviceId, date, extra = {}) => {
  if (!io) return;
  io.to(room(String(serviceId), date)).emit("queue:update", {
    serviceId: String(serviceId),
    date,
    ...extra,
  });
};