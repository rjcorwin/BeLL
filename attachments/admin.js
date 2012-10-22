

jQuery.fn.saveResourceForm = function(itemID, itemType) {
  
  var db = document.URL.split("/")[3]

  // Get all of the values from the form fields
  var itemTitle = $('.settingsForm input#title').val(),
    itemAuthor = $('.settingsForm input#author').val(),
    itemDescription = $('.settingsForm textarea#description').val(),
    itemDate = $('.settingsForm input#date').val(),
    itemRev = $('.settingsForm input#_rev').val(),
    itemDelete = $('.settingsForm input#delete:checked').val(),
    itemSubject = $('.settingsForm select#subject').val(),
    itemNewSubject = $('.settingsForm input#newSubject').val(),
    itemLevel = $('.settingsForm select#level').val(),
    itemNewLevel = $('.settingsForm input#newLevel').val(),
    itemFilename = $('.settingsForm input:file').val(), 
    itemResourceURL = $('.settingsForm input#resourceURL').val();
  
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
 
      
  // Add new record
  uniqueID = $.couch.newUUID();
  itemID = itemTitle.replace(/[\s]/g,'_');
  itemID = itemID.replace(/[^a-z 0-9 _ -]+/gi,'') + uniqueID;
  
  
  $('form .settingsForm').attr({"action":"/"+ db +"/"+ itemID});
  
  // Save information
  $.couch.db(db).saveDoc({
    "_id": itemID,
    "filename":itemFilename,
    "title":itemTitle,
    "author":itemAuthor,
    "type": "resource",
    "description":itemDescription,
    "date":itemDate,
    "level": parseInt(itemLevel),
    "subject": itemSubject,
    "resource_url": itemResourceURL
  }, {
    success: function(){
      
      // Get saved info, then add attachment to item
      $.getJSON("/"+ db +"/"+ itemID, function(revData) {
        
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
          url: "/"+ db +"/"+ itemID,
          success: function(resp) {
            $.getJSON("/"+ db +"/"+ itemID, function(saveData) {
              itemRev = saveData._rev;
              itemAttachment = saveData._attachments;
              
              // Resave all information
              $.couch.db(db).saveDoc({
                "_id": itemID,
                "_rev": itemRev,
                "type": "resource",
                "filename":itemFilename,
                "title":itemTitle,
                "author":itemAuthor,
                "description":itemDescription,
                "date":itemDate,
                "level": parseInt(itemLevel),
                "subject": itemSubject,
                "resource_url": itemResourceURL,
                "_attachments":itemAttachment
              }, {
                success: function() { 
                  window.location.replace("app.html");
                }
              });
            });
          }
        });
      });
    }
  });     
};
