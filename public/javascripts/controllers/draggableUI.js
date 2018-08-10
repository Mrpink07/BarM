$( function() {
  $( ".draggable" ).draggable({
    axis: 'x',
    containment: 'parent'
  });
} );

$('.draggable').on('mousedown', function() {
    console.log("HI");
});

// This function gets called when a slider is moved
function setDelay(item) {
  var left = $(item).css('left');
  left = parseInt(left);
  var id = $(item).attr('data-delayid');
  
  console.log(left);
  
  document.getElementById(id).value = left;
  
  // Trigger an event Angular actually checks for
  $('#' + id).trigger('input'); // Use for Chrome/Firefox/Edge
  $('#' + id).trigger('change'); // Use for Chrome/Firefox/Edge + IE11
  angular.element(jQuery('#' + id)).triggerHandler('input')
}