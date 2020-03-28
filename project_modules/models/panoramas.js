const mongoose = require('mongoose')

// création du schéma des panoramas (correspond à un constructeur)
const panosSchema = new mongoose.Schema({ numPano: Number, namePano: String });

// construit dans la collection (équivalent table SQL) "panos"
module.exports.panos = mongoose.model("panos", panosSchema);