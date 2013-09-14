var zipcode = '04106';
$(document).ready(function(){
  $.ajax({
    url: 'http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20location%3D' + zipcode + '&format=json&diagnostics=true&callback=',
    dataType: 'json',
    success: function(data){
      setWeather(data);
    }
  });
})

function setWeather(data) {
  var item = data['query']['results']['channel']['item'];
  var condition = item['condition'];
  var text = '<p>' + item['title'] + '<br />';
  text += condition['date'] + '<br />';
  text += condition['text'];
  text += '<img src="' + item['description'].substring(11,48) + '" /> ';
  text += condition['temp'] + ' F&deg;</p>';
  $('#weather').html(text);
}
