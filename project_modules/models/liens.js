const mongoose = require('mongoose')
const Schema = mongoose.Schema

// création du schéma des liens (correspond à un constructeur)
const liensSchema = new Schema({
    puce: { type: Schema.ObjectId, ref: 'puces' },
    pano: { type: Schema.ObjectId, ref: 'panos' }
});

// construit dans la collection (équivalent table SQL) "liens"
module.exports.liens = mongoose.model("liens", liensSchema);