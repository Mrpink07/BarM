// Set a timeout to check connections

// Check connection to machine
setInterval(function () {
  $.ajax({
    url: 'http://' + window.location.hostname + ':3000',
    complete: function(xhr, textStatus) {
      // If we get a successful connection hide any errors
      if (xhr.status == 200) {
        $('.error-overlay').hide();
      } else {
        // Otherwise show the error
        $('.error-overlay').show();
      }
    },
  });
}, 2000);


// Check connection to internet
setInterval(function () {
  $.ajax({
    url: 'https://api.ipify.org',
    complete: function(xhr, textStatus) {
      console.log(xhr.status);
      // If we get a successful connection hide any errors
      if (xhr.status == 200) {
        $('.error-status-icon').hide();
      } else {
        // Otherwise show the error
        $('.error-status-icon').show();
      }
    },
  });
}, 30000);
