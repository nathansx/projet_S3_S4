const mongoose = require('mongoose')

// création du schéma des liens (correspond à un constructeur)
const liensSchema = new mongoose.Schema({ numPuce: String, numPano: Number });

// construit dans la collection (équivalent table SQL) "liens"
module.exports.liens = mongoose.model("liens", liensSchema);