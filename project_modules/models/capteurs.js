const mongoose = require('mongoose')
const Schema = mongoose.Schema

// création du schéma des panoramas (correspond à un constructeur)
const capteursSchema = new Schema({
    numPuce: Number,
    namePuce: String,
    panos: [{ type: Schema.Types.ObjectId, ref: 'panos' }]
});

// construit dans la collection (équivalent table SQL) "panos"
module.exports.puces = mongoose.model("puces", capteursSchema);