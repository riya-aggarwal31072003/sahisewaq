import { io } from "socket.io-client";

const serviceId = process.argv[2];
if (!serviceId) {
  console.log("Usage: node scripts/socket-listen.js <serviceId>");
  process.exit(1);
}

const date = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
const socket = io(process.env.API_URL || "http://localhost:5000");

socket.on("connect", () => {
  console.log("connected:", socket.id);
  socket.emit("join", { serviceId, date });
  console.log(`listening for queue updates on ${date} ...`);
});

socket.on("queue:update", (data) =>
  console.log(new Date().toLocaleTimeString(), "queue:update", data)
);