var zipcode = '10007';

$(document).ready(function () {
  useDefaultLocation();
})

function updatePage() {
  getWeather();
  getNews();
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

function getNews() {
  $.ajax({
    url: 'http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20rss%20where%20url%20%3D%20%22http%3A%2F%2Fnews.google.com%2Fnews%3Fgeo%3D' + zipcode + '%26output%3Drss%22%20limit%205&format=json&diagnostics=true&callback=',
    dataType: 'json',
    success: function (data) {
      setNews(data);
    }
  });
}

function setNews(data) {
  var item = data['query']['results']['item'];
  $('#news_item1').html('<a href="' + item[0]['link'] + '">' + item[0]['title'] + '</a>');
  $('#news_item2').html('<a href="' + item[1]['link'] + '">' + item[1]['title'] + '</a>');
  $('#news_item3').html('<a href="' + item[2]['link'] + '">' + item[2]['title'] + '</a>');
  $('#news_item4').html('<a href="' + item[3]['link'] + '">' + item[3]['title'] + '</a>');
  $('#news_item5').html('<a href="' + item[4]['link'] + '">' + item[4]['title'] + '</a>');
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
  getZipAndCordsFromInput(document.getElementById("location").value);
}

function getZipAndCordsFromInput(userInput) {
  $.ajax({
    url: 'http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20geo.placefinder%20where%20text%3D%22' + userInput + '%22&format=json&diagnostics=true&callback=',
    dataType: 'json',
    success: function (data) {
      setZipAndCords(data);
    }
  });
}

function setZipAndCords(data) {
  getLocation(data['query']['results']['Result']['latitude'], data['query']['results']['Result']['longitude']);
}

function useDefaultLocation() {
  // Does this browser support geolocation?
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(getLocationSuccess, getLocationError);
  } else {
    showError("Your browser does not support Geolocation!");
  }
}

function getLocationSuccess(position) {
  document.getElementById("location").value = "";
  getLocation(position.coords.latitude, position.coords.longitude);
}

function getLocation(lat, lon) {
  $.ajax({
    url: 'http://query.yahooapis.com/v1/public/yql?q=select%20postal%20from%20geo.placefinder%20where%20text%3D%22' + lat + ',' + lon + '%22%20and%20gflags%3D%22R%22&format=json&diagnostics=true&callback=',
    dataType: 'json',
    success: function (data) {
      locationCB(data);
    }
  });
}

function locationCB(data) {
  zipcode = data['query']['results']['Result']['postal'];
  updatePage();
}

function getLocationError(error){
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