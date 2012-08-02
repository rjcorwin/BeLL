// lib/app.js

exports.views = {
    grades: {
    	map: function(doc){ 
        	if (doc.grade) {
        		emit(doc.grade, 1)
        	}
        }
    },
    subjects: {
    	map: function(doc) {
    		if (doc.subject) {
        		emit(doc.subject, 1)
        	}
    	}
    },
    grade_subjects: {
    	map: function(doc) {
    		if (doc.grade) {
        		emit([doc.grade, doc.subject], doc._rev)
        	}
    	}
    },
    grade_subjects2: {
    	map: function(doc) {
    		if (doc.subject) {
                // This will be queried like startkey=[{{grade}}, 'a']
                // &endkey=[{{grade}}, 'z'] so that only subjects in that
                // grade can be returned
        		emit([doc.category, doc.subject], doc.subject)
        	}
    	}
    }
};