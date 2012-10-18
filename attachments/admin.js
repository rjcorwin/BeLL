
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


jQuery.fn.saveResourceForm = function(itemID, itemType) {
  
  // Get all of the values from the form fields
  var itemTitle = $('.settingsForm input#title').val(),
    itemAuthor = $('.settingsForm input#author').val(),
    itemDescription = $('.settingsForm textarea#description').val(),
    itemDate = $('.settingsForm input#date').val(),
    itemRev = $('.settingsForm input#_rev').val(),
    itemDelete = $('.settingsForm input#delete:checked').val(),
    itemType = $('.settingsForm select').val(),
    itemFilename = $('.settingsForm input:file').val(); 
  
  // Check for new uploaded file
  if (itemFilename == undefined || itemFilename == ""){
    $('.settingsForm input:file').remove();
    itemFilename = "";
  }
  else {
    itemFilename = itemFilename.replace(/^C:\\fakepath\\/i, '');
  }
  
  
   // If no new file, then fall back on the old filename
  if (!itemFilename || itemFilename.length == 0) {
    itemFilename = $('.settingsForm input#filename').val();
  }
  
  // Force to add a title (the only required field)
  if (!itemTitle || itemTitle.length == 0) {
    alert(libLang.addTitle); // Get text for language
    return;
  }
  
  // Check if size of db is above the limit
  dbSize = maxDBSize;
  $.ajax({
    url: "/"+ homeURL,
    dataType: 'json',
    async: false,
    success: function(dbInfo){
      dbSize = dbInfo.data_size;
    }
  });
  if (itemDelete != 'Yes' && dbSize >= maxDBSize){
    alert(libLang.noSpace);
    return;
  }
  
  
  
  /*
  // Requires an uploaded file
  if (!revData._attachments || revData._attachments.length == 0) {
    alert("Please select a file to upload.");
    return;
  }*/
  
  
  
  
  if (itemDelete != 'Yes'){
  
    if (itemID != 'add'){
      
      // Update existing record
      $(this).ajaxSubmit({
        url: "/"+ homeURL +"/"+ itemID,
        data: {"filename":itemFilename},
        success: function(resp) {
        
          $.getJSON("/"+ homeURL +"/"+ itemID, function(revData) {
            itemRev = revData._rev;
            itemAttachment = revData._attachments;
            user = revData.user;
            
            if (!revData._attachments || revData._attachments.length == 0) {
              
              $.couch.db(homeURL).saveDoc({
                "_id": itemID,
                "_rev": itemRev,
                "filename":itemFilename,
                "title":itemTitle,
                "author":itemAuthor,
                "type":itemType,
                "description":itemDescription,
                "date":itemDate,
                "user":user
              }, {
                success: function() { 
                  alert(libLang.saved); // Get text for language
                  window.location.replace("index.html");
                }
              });
            }
            else {
              $.couch.db(homeURL).saveDoc({
                "_id": itemID,
                "_rev": itemRev,
                "filename":itemFilename,
                "title":itemTitle,
                "author":itemAuthor,
                "type":itemType,
                "description":itemDescription,
                "date":itemDate,
                "user":user,
                "_attachments":itemAttachment
              }, {
                success: function() { 
                  alert(libLang.saved); // Get text for language
                  window.location.replace("index.html");
                }
              });
            };
          });
        }
      });
    } 
    else {
      
      
      // Add new record
      uniqueID = $.couch.newUUID();
      itemID = itemTitle.replace(/[\s]/g,'_');
      itemID = homeUser +'-'+ itemType.charAt(0).toUpperCase() + itemType.slice(1) +'-'+  encodeURI(itemID) +'-'+ uniqueID;
      itemID = itemID.replace(/[^a-z 0-9 _ -]+/gi,'');
      
      
      $('form .settingsForm').attr({"action":"/"+ homeURL +"/"+ itemID});
      
      // Save information
      $.couch.db(homeURL).saveDoc({
        "_id": itemID,
        "filename":itemFilename,
        "title":itemTitle,
        "author":itemAuthor,
        "type":itemType,
        "description":itemDescription,
        "date":itemDate,
        "user":homeUser
      }, {
        success: function(){
          
          // Get saved info, then add attachment to item
          $.getJSON("/"+ homeURL +"/"+ itemID, function(revData) {
            
            $('.settingsForm input#_rev').val(revData._rev);
            
            var data = {};

            $.each($("form :input").serializeArray(), function(i, field) {
              data[field.name] = field.value;
            });
            
            $("form :file").each(function() {
              data[this.name] = this.value.replace(/^C:\\fakepath\\/g, ''); // file inputs need special handling
            });
            
            itemFilename = data._attachments;
              
            
            $('form.settingsForm').ajaxSubmit({
              url: "/"+ homeURL +"/"+ itemID,
              success: function(resp) {
                $.getJSON("/"+ homeURL +"/"+ itemID, function(saveData) {
                  itemRev = saveData._rev;
                  itemAttachment = saveData._attachments;
                  
                  // Resave all information
                  $.couch.db(homeURL).saveDoc({
                    "_id": itemID,
                    "_rev": itemRev,
                    "filename":itemFilename,
                    "title":itemTitle,
                    "author":itemAuthor,
                    "type":itemType,
                    "description":itemDescription,
                    "date":itemDate,
                    "user":homeUser,
                    "_attachments":itemAttachment
                  }, {
                    success: function() { 
                      alert(libLang.saved); // Get text for language
                      window.location.replace("index.html");
                    }
                  });
                });
              }
            });
          });
        }
      });     
    };      
  } else {
    // Delete the item from the library
    $.couch.db(homeURL).removeDoc({'_id': itemID, "_rev": itemRev});
    window.location.replace("index.html");
  } 
};
