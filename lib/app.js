// lib/app.js

exports.views = {
    makes: {
        map: function (doc) {
            emit(doc.make, null);
        }
    }
};