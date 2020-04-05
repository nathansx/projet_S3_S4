const mongoose = require('mongoose')
const Schema = mongoose.Schema

// création du schéma des panoramas (correspond à un constructeur)
// un numéro, un nom, un capteur associé
const panosSchema = new Schema({
    numPano: Number,
    namePano: String,
    puce: { type: Schema.Types.ObjectId, ref: 'puces' }
});

// construit dans la collection (équivalent table SQL) "panos"
module.exports.panos = mongoose.model("panos", panosSchema);