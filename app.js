import mongoose from "mongoose"
import express from "express"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import Campground from "./models/campground.js"
import methodOverride from "method-override"
import ejsMate from "ejs-mate"
import ExpressError from "./utils/ExpressError.js"
import { catchAsync } from "./utils/catchAsync.js"
import { campgroundSchema } from "./schemas/index.js"

const app = express()
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const connectDb = async function () {
  try {
    await mongoose.connect("mongodb://localhost:27017/yelp-camp")
    console.log("Connected to Mongo")
  } catch (error) {
    console.log(`Mongo Connection Error: ${error}`)
  }
}

connectDb()

app.engine("ejs", ejsMate)
app.set("views", join(__dirname, "views"))
app.set("view engine", "ejs")
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride("_method"))

const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body)
  if (error) {
    const message = error.details.map((el) => el.message).join(",")
    throw new ExpressError(message, 400)
  } else {
    next()
  }
}

app.get("/", (req, res) => {
  res.render("home")
})

app.get(
  "/campgrounds",
  catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render("campgrounds/index", { campgrounds })
  })
)

app.get("/campgrounds/new", (req, res) => {
  res.render("campgrounds/new")
})

app.post(
  "/campgrounds",
  validateCampground,
  catchAsync(async (req, res) => {
    // if (!req.body.campground) throw new ExpressError("Invalid Data", 400)
    const campground = new Campground(req.body.campground)
    await campground.save()
    res.redirect(`/campgrounds/${campground._id}`)
  })
)

app.get(
  "/campgrounds/:id",
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render("campgrounds/show", { campground })
  })
)

app.get(
  "/campgrounds/:id/edit",
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render("campgrounds/edit", { campground })
  })
)

app.put(
  "/campgrounds/:id",
  validateCampground,
  catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    })
    res.redirect(`/campgrounds/${campground._id}`)
  })
)

app.delete(
  "/campgrounds/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findByIdAndDelete(id)
    res.redirect("/campgrounds")
  })
)

app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404))
})

app.use((err, req, res, next) => {
  const { message = "Something Went Wrong", statusCode = 500 } = err
  res.status(statusCode).render("error", { err, message, statusCode })
})

app.listen(3000, () => {
  console.log(`Serving on port http://localhost:3000`)
})
