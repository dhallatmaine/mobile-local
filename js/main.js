var zipcode = '';

$(document).ready(function () {
  $('#header').hide();
  $('#news').hide();
  $('#footer').hide();
  setPreviousSearches();
})

function updatePage() {
  getWeather();
  getNews();
  addToPreviousSearches(zipcode);
  setPreviousSearches();
  hideLocationSearch();
}

function showLocation() {
  $('#app').hide();
  showLocationSearch();
}

function hideLocationSearch() {
  $('#locationForm').hide();
  $('#app').show();
}

function showLocationSearch() {
  $('#locationForm').show();
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
  var day = new Date(item[0]['pubDate']);
  $('#news_item1').html('<span class="date">' + day.getMonth() + '/' + day.getDate() + '</span><a href="' + item[0]['link'] + '" class="newsLink">' + item[0]['title'] + '</a>');
  day = new Date(item[1]['pubDate']);
  $('#news_item2').html('<span class="date">' + day.getMonth() + '/' + day.getDate() + '</span><a href="' + item[1]['link'] + '" class="newsLink">' + item[1]['title'] + '</a>');
  day = new Date(item[2]['pubDate']);
  $('#news_item3').html('<span class="date">' + day.getMonth() + '/' + day.getDate() + '</span><a href="' + item[2]['link'] + '" class="newsLink">' + item[2]['title'] + '</a>');
  day = new Date(item[3]['pubDate']);
  $('#news_item4').html('<span class="date">' + day.getMonth() + '/' + day.getDate() + '</span><a href="' + item[3]['link'] + '" class="newsLink">' + item[3]['title'] + '</a>');
  day = new Date(item[4]['pubDate']);
  $('#news_item5').html('<span class="date">' + day.getMonth() + '/' + day.getDate() + '</span><a href="' + item[4]['link'] + '" class="newsLink">' + item[4]['title'] + '</a>');
  $('#news').show();
}

function setWeather(data) {
  var channel = data['query']['results']['channel'];
  var location = channel['location'];
  var item = channel['item'];
  var condition = item['condition'];
  var forecast = item['forecast'];

  var currentWeather = '<img src="http://l.yimg.com/a/i/us/we/52/' + condition['code'] + '.gif" /><br />' + condition['text'];
  $('#currentWeather').html(currentWeather);

  var currentLocation = location['city'] + '<br /><span class="temperature">' + condition['temp'] + '&deg; F</span>';
  $('#currentLocation').html(currentLocation);

  var today = forecast[0]['day'] + '<br />';
  today += '<img src="http://l.yimg.com/a/i/us/we/52/' + forecast[0]['code'] + '.gif" width="25px" height="25px" /><br />';
  today += forecast[0]['low'] + '&deg;F / ' + forecast[0]['high'] + '&deg;F';
  $('#today').html(today);

  var tomorrow = forecast[1]['day'] + '<br />';
  tomorrow += '<img src="http://l.yimg.com/a/i/us/we/52/' + forecast[1]['code'] + '.gif" width="25px" height="25px" /><br />';
  tomorrow += forecast[1]['low'] + '&deg;F / ' + forecast[1]['high'] + '&deg;F';
  $('#tomorrow').html(tomorrow);

  var extended = forecast[2]['day'] + '<br />';
  extended += '<img src="http://l.yimg.com/a/i/us/we/52/' + forecast[2]['code'] + '.gif" width="25px" height="25px" /><br />';
  extended += forecast[2]['low'] + '&deg;F / ' + forecast[2]['high'] + '&deg;F';
  $('#extended').html(extended);

  $('#header').show();
  $('#footer').show();
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
    url: 'http://maps.googleapis.com/maps/api/geocode/json?latlng=' + lat + ',' + lon + '&sensor=true',
    dataType: 'json',
    success: function (data) {
      locationCB(data);
    }
  });
}

function locationCB(data) {
  zipcode = extractFromAddress(data['results']['0']['address_components'], "postal_code");
  updatePage();
}

//because google geocoding kind of sucks, you have to loop through and "figure" out where the hell the zip code is
function extractFromAddress(components, type){
  for (var i = 0; i < components.length; i++)
    for (var j=0; j < components[i].types.length; j++)
      if (components[i].types[j] == type) return components[i].long_name;
  return '';
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

function addToPreviousSearches(zip) {
  var zips = localStorage.getItem('zips');
  var local = new Array();
  if (zips != null) {
    local = JSON.parse(localStorage.getItem('zips'));
  }
  local.push(zip);
  localStorage.setItem('zips', JSON.stringify(local));
}

function setPreviousSearches() {
  var local = localStorage.getItem('zips');
  var zips = JSON.parse(local).reverse();
  if (zips != null) {
    var loop = zips.length > 5 ? 5 : zips.length;
    var out = '';
    for (var i = 0; i < loop; i++) {
      out += '<li><a href="" onclick="setSearch(this.innerHTML)">' + zips[i] + '</a></li>'
    }
    $('#previous').html(out);
  }
}

function setSearch(zip) {
  document.getElementById("location").value = zip;
  updateLocation();
}

function clearLocations() {
  zipcode = '';
  document.getElementById("location").value = "";
  localStorage.clear();
  location.reload();
}