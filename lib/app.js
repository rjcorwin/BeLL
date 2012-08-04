// lib/app.js

exports.views = {
    
    
    /*
     * Get all grades and number of documents in that grade.
     * 
     * /_design/hammock/_view/grades?group=true
     */
    grades: {
    	map: function(doc){ 
        	if (doc.grade && doc.type == 'resource') {
        		emit(doc.grade, 1)
        	}
        },
        reduce: function(keys, values) {
        	return values.length
		}
    },
    

    /*
     * Get all subjects in each grade and number of documents in that grade subject.

		view: _design/hammock/_view/grade_subjects?group_level=1
		result: distinct grades and number of documents in that grade.

		view: _design/hammock/_view/grade_subjects?group=true&startkey=[1,"a"]&endkey=[1,"z"]
		result: all subjects for grade one
    		
    */
    grade_subjects: {
    	map: function(doc) {
    		if (doc.grade && doc.subject && doc.type == 'resource') {
        		emit([doc.grade, doc.subject], doc._id)
        	}
    	},
    	reduce: function(tag, counts) {
		  return tag.length
		} 
    },

    /*
     * Get all resources for given grade and subject.
     * @todo Figure out how to modify the reduce in grade_subjects view so I we can roll this 
       view into it.

		view: _design/hammock/_view/grade_subjec_resourcess?key=['grade', 'subject']
		result: A list of document IDs for the given grade and subject.
    		
    */
    grade_subject_resources: {
    	map: function(doc) {
    		if (doc.grade && doc.subject && doc.type == 'resource') {
        		emit([doc.grade, doc.subject], doc._id)
        	}
    	}
    },

    /*
     * SELECT subject FROM documents_table;
     */
    subjects_all: {
    	map: function(doc) {
    		if (doc.subject) {
        		emit(doc.subject, 1)
        	}
    	}
    },


	grades_all: {
    	map: function(doc){ 
        	if (doc.grade) {
        		emit(doc.grade, 1)
        	}
        }
    },

};



