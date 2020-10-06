const mongoose = require('mongoose')
const Schema = mongoose.Schema

// création du schéma des panoramas (correspond à un constructeur)
// un numéro, un nom et une liste de panorama associés
const capteursSchema = new Schema({
    numSensor: Number,
    nameSensor: String,
    panos: [{ type: Schema.Types.ObjectId, ref: 'panos' }]
});

// construit dans la collection (équivalent table SQL) "panos"
module.exports.sensors = mongoose.model("sensors", capteursSchema);