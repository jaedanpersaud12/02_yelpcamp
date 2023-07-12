import mongoose from "mongoose"
import Campground from "../models/campground.js"
import cities from "./cities.js"
import { places, descriptors } from "./seedHelpers.js"

const connectDb = async function () {
  try {
    await mongoose.connect("mongodb://localhost:27017/yelp-camp")
    console.log("Connected to Mongo")
  } catch (error) {
    console.log(`Mongo Connection Error: ${error}`)
  }
}

connectDb()

const sample = (arr) => arr[Math.floor(Math.random() * arr.length)]

const seedDB = async () => {
  await Campground.deleteMany({})
  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000)
    const price = Math.floor(Math.random() * 100) + 10
    const camp = new Campground({
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      image: `https://source.unsplash.com/collection/483251`,
      description:
        "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Reiciendis nesciunt, at maxime distinctio numquam atque molestias corrupti molestiae amet consequatur.",
      price,
    })
    await camp.save()
  }
}

seedDB().then(() => {
  mongoose.connection.close()
})
