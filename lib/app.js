// lib/app.js

exports.views = {
    // /_design/hammock/_view/grades?group=true
    grades: {
    	map: function(doc){ 
        	if (doc.grade) {
        		emit(doc.grade, 1)
        	}
        },
        reduce: function(keys, values) {
        	return values.length;
		}
    },
    subjects: {
    	map: function(doc) {
    		if (doc.subject) {
        		emit(doc.subject, 1)
        	}
    	},
    	reduce: function(tag, counts) {
		  return tag.length;
		}
    },
    /*
    	I want to get every distinct subject for a defined grade. Bonus points for the number
    	of documents in each of those subjects for that grade.

    	I want to do something server side like the following for all distinct subjects in
    	grade 1:
    	_design/hammock/_view/grade_subjects?group=true&startkey=[ "1", "a"]&endkey=["1", "z"]

    	But I will have to use a simple group=true and remove the other grades client side
    	until I figure this out:
    	_design/hammock/_view/grade_subjects?group=true
    */
    grade_subjects: {
    	map: function(doc) {
    		if (doc.grade) {
        		emit([doc.grade, doc.subject], 1)
        	}
    	},
    	reduce: function(tag, counts) {
		  return tag.length;
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



