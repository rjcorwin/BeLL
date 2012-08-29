
function deleteAllFeedback() {
  $.couch.db("library").view("library/feedback_all", {
    success: function(result) {
      $.each(result.rows, function(key, value) {
        $.couch.db("library").openDoc(value.key, {
          success: function(doc) {
            $.couch.db("library").removeDoc(doc)
          }
        })
      })
    }
  })
}


function deleteAllResources() {
  $.couch.db("library").view("library/resource_all", {
    success: function(result) {
      $.each(result.rows, function(key, value) {
        $.couch.db("library").openDoc(value.key, {
          success: function(doc) {
            $.couch.db("library").removeDoc(doc)
          }
        })
      })
    }
  })
}
