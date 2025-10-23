// seedEvents.js
import mongoose from "mongoose";
import Event from "./models/Event.js"; // note the .js extension

mongoose.connect("mongodb://127.0.0.1:27017/eventhub", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const events = [
  {
    name: "Rock Concert",
    description: "A night of rock music.",
    date: new Date("2025-12-15T20:00:00Z"),
    location: "Ahmedabad",
    price: 500,
    category: "Music",
    image: "https://source.unsplash.com/random/400x200?concert",
    availableSeats: 100,
  },
  {
    name: "Art Workshop",
    description: "Learn painting and sketching.",
    date: new Date("2025-11-20T10:00:00Z"),
    location: "Surat",
    price: 200,
    category: "Workshop",
    image: "https://source.unsplash.com/random/400x200?art",
    availableSeats: 30,
  },
  // ...add 8 more events
];

Event.insertMany(events)
  .then(() => {
    console.log("Events added successfully!");
    mongoose.disconnect();
  })
  .catch((err) => console.log(err));
