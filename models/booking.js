const mongoose=require("mongoose");
const Schema = mongoose.Schema;
const Listing= require("./listing.js")
const User= require("./user.js")

const bookingSchema = new Schema({
    name: {
        type: String
    },

    phone: {
        type: String,
    },

    days: {
        type: Number,
    },

    people: {
        type: Number,
    },

    from: {
        type: String,
    },

    to: {
        type: String,
    },

    client: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },

    property: {
        type: Schema.Types.ObjectId,
        ref: "Listing",
    },


});

const Booking =mongoose.model("booking", bookingSchema);
module.exports= Booking; 