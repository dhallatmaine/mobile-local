var zipcode = '94089';
var currentLocation = null;

$(document).ready(function () {
  getWeather();
})

function updatePage() {
  getWeather();
  //getNews();
}

function getWeather() {
  $.ajax({
    url: 'http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20location%3D' + zipcode + '&format=json&diagnostics=true&callback=',
    dataType: 'json',
    success: function (data) {
      setWeather(data);
    }
  });
}

function setWeather(data) {
  var item = data['query']['results']['channel']['item'];
  var condition = item['condition'];
  var text = '<p>' + item['title'] + '<br />';
  text += condition['date'] + '<br />';
  text += condition['text'];
  text += '<img src="http://l.yimg.com/a/i/us/we/52/' + condition['code'] + '.gif" />';
  text += condition['temp'] + ' F&deg;</p>';
  $('#weather').html(text);
}

function updateLocation() {
  zipcode = document.getElementById("location").value;
  updatePage();
}

function useDefaultLocation() {
  // Does this browser support geolocation?
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(locationSuccess, locationError);
  } else {
    showError("Your browser does not support Geolocation!");
  }
}

function setLocation(data) {
  zipcode = data['query']['results']['Result']['postal'];
  updatePage();
}

function locationSuccess(position) {
  var lat = position.coords.latitude;
  var lon = position.coords.longitude;

  $.ajax({
    url: 'http://query.yahooapis.com/v1/public/yql?q=select%20postal%20from%20geo.placefinder%20where%20text%3D%22' + lat + ',' + lon + '%22%20and%20gflags%3D%22R%22&format=json&diagnostics=true&callback=',
    dataType: 'json',
    success: function (data) {
      setLocation(data);
    }
  });
}


function locationError(error){
  switch(error.code) {
    case error.TIMEOUT:
      showError("A timeout occured! Please try again!");
      break;
    case error.POSITION_UNAVAILABLE:
      showError('We can\'t detect your location. Sorry!');
      break;
    case error.PERMISSION_DENIED:
      showError('Please allow geolocation access for this to work.');
      break;
    case error.UNKNOWN_ERROR:
      showError('An unknown error occured!');
      break;
  }

}

function showError(msg){
  $('#weather').html(msg);
}