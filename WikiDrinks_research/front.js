$(document).ready(function(){
  $('.slider').slider();
});

$(document).ready(function(){
  $('.sidenav').sidenav();
});

$('.dropdown-trigger').dropdown();



$(document).ready(function() {
  $('select').formSelect();
});

// Wait for page to be ready before applying CSS changes
$( document ).ready(function() {
  $(".dropdown-content.select-dropdown > li span").css("color", "red");
});