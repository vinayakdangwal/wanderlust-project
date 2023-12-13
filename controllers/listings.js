const Listing=require("../models/listing");
const Booking= require("../models/booking.js")
const User= require("../models/user.js")
const Review= require("../models/review.js")
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken= process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({accessToken: mapToken});

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs", { allListings });
};

module.exports.showListings = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("./listings/showlistings.ejs", { allListings });
};

module.exports.showBookings = async (req, res) => {
    const allBookings = await Booking.find({});
    const allListings = await Listing.find({});
    res.render("./listings/showbookings.ejs", { allBookings, allListings });
};

module.exports.showRequests = async (req, res) => {
    const allBookings = await Booking.find({});
    const allListings = await Listing.find({});
    res.render("./listings/showrequests.ejs", { allBookings, allListings });
};



module.exports.renderNewForm =  (req, res) => {
    res.render("./listings/new.ejs");
};

module.exports.showListing= async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).
    populate({
        path:"reviews",
        populate: {
            path: "author",
        }
    })
    .populate("owner");
    if(!listing){
        req.flash("error", "Listing not found!");
        res.redirect("/listings")
    }
    res.render("./listings/show.ejs", { listing });
};

module.exports.createListing= async (req, res) => {
    let response= await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
      })
        .send();

    console.log(response.body.features);
        

    let url= req.file.path;
    let filename=req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner= req.user._id;
    newListing.image= {url,filename};
    newListing.geometry = response.body.features[0].geometry;
    let savedListing= await newListing.save();
    console.log(savedListing);
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");



};

module.exports.searchListing= async (req,res) => {
    console.log(req.body.dest);
    let loc= req.body.dest;
    console.log(loc.place);
    const allListings = await Listing.find({});
    res.render("./listings/searchlistings.ejs", {loc, allListings})
}

module.exports.createBooking= async (req, res) => {
    let {id}= req.params;
    const newBooking = new Booking(req.body.booking);
    newBooking.client= req.user._id;
    newBooking.property= id;
    let savedBooking= await newBooking.save();
    console.log(savedBooking);
    req.flash("success", "New Booking Created!");
    res.redirect("/listings");



};

module.exports.renderEditForm= async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing not found!");
        res.redirect("/listings")
    }

    let originalImageUrl= listing.image.url;
    originalImageUrl= originalImageUrl.replace("/upload", "/upload/h_150,w_250")
    res.render("./listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.renderReserveForm= async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing not found!");
        res.redirect("/listings")
    }

    res.render("./listings/booking.ejs", { listing});
};

module.exports.updateListing= async (req, res) => {
    let { id } = req.params;
    let listing= await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    
    if(typeof req.file !== "undefined"){
        let url= req.file.path;
        let filename=req.file.filename;
        listing.image= {url, filename};
        await listing.save();
    }
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyBooking= async (req, res) => {
    let { id } = req.params;
    let deletedBooking = await Booking.findByIdAndDelete(id);
    console.log(deletedBooking);
    req.flash("success", "Booking Cancelled!");
    res.redirect("/listings/bookings");
};

module.exports.destroyListing= async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};