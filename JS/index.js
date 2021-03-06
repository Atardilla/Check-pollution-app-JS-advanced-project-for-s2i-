//constants and variables
const cityName = document.querySelector('.input-text');
const searchForm = document.querySelector('.search-form');

const aqiIndex = document.getElementById('aqi-index');
const aqiLevelMessage = document.getElementById('aqi-level');
const heathImplications = document.getElementById('health-implications');
const cautionaryStatement = document.getElementById('cautionary-statement');

let currentCity ='';

const map = L.map('mapid', { zoomControl: false });
new L.Control.Zoom({ position: 'bottomleft' }).addTo(map);
let marker ='';

// Render results and layout for user position
const startingPoint = async function(){
  try{
   const res = await fetch(`https://api.waqi.info/feed/here/?token=1a3e3d1e541f52ae2b24fc3036c9ca3902557c2d`)
   const resJson = await res.json();
   const city = resJson.data.city.name;
   const aqi = resJson.data.aqi;
   renderResJson(aqi, city);
   renderMap(city);
  } catch (err){
    console.error(err.message); 
  }
}

// Get coordinates from city
const getCoords = async function (city){
  const coordinates = fetch(`https://api.opencagedata.com/geocode/v1/json?q=${city}&key=33391df72f7d48e39576fde1f6b56d60`);
  return coordinates;
}

// Get city from coordinates
const getCity = async function (coords){
  const city = fetch(`https://api.opencagedata.com/geocode/v1/json?q=${coords[0]}+${coords[1]}&key=33391df72f7d48e39576fde1f6b56d60`);
  return city;
}

// Recieve city name, get coordinates and render the first map
const renderMap = async function(city){
  let coords =  (await getCoords(city)).json();
  coordsRes = (await coords).results[0].geometry;
  coordsArr = Object.values(coordsRes);

  map.setView(coordsArr, 6);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  L.tileLayer('https://tiles.aqicn.org/tiles/usepa-aqi/{z}/{x}/{y}.png?token=1a3e3d1e541f52ae2b24fc3036c9ca3902557c2d').addTo(map);
  marker = L.marker(coordsArr);
  marker.addTo(map);
 }

// Render map and layout for city wrote by user
const renderCity = async function (city){
  try {
    const res = await fetch(`https://api.waqi.info/feed/${city}/?token=1a3e3d1e541f52ae2b24fc3036c9ca3902557c2d`);
    const resJson = await res.json();
    if(resJson.status == 'error'){
      divmap.innerHTML = `Can't find the place, sorry!`;
      throw new Error (`"${resJson.data}."Maybe look for closest station from you!`)
    }
    renderResJson(resJson.data.aqi, city);
    addMarker(city);
  } catch (err) {
    console.error(err.message);
    errorLayout();
  }
}

 // Add new marker on city searched by user
 const addMarker = async function(city){
  let coords =  (await getCoords(city)).json();
  coordsRes = (await coords).results[0].geometry;
  coordsArr = Object.values(coordsRes);
  marker.removeFrom(map);
  marker = L.marker(coordsArr);
  marker.addTo(map);
  map.setView(coordsArr);
 }

// Render layout
renderResJson = function(aqi, city){
  if(aqi > 300){
    aqiIndex.innerText = `${city}: ??? ${aqi} ???`;
    aqiLevelMessage.innerText = '???? Hazardous! ????';
    heathImplications.innerText = 'Health alert: everyone may experience more serious health effects';
    cautionaryStatement.innerText = 'Everyone should avoid all outdoor exertion';
  } else if (aqi > 200){
    aqiIndex.innerText = `${city}: ???? ${aqi} ????`;
    aqiLevelMessage.innerText = '???? Very unhealthy ????';
    heathImplications.innerText = 'Health warnings of emergency conditions. The entire population is more likely to be affected.';
    cautionaryStatement.innerText = 'Active children and adults, and people with respiratory disease, such as asthma, should avoid all outdoor exertion; everyone else, especially children, should limit outdoor exertion.';
  } else if (aqi > 150){
    aqiIndex.innerText = `${city}: ???? ${aqi} ????`;
    aqiLevelMessage.innerText = '???? Unhealthy ????';
    heathImplications.innerText = 'Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects';
    cautionaryStatement.innerText = 'Active children and adults, and people with respiratory disease, such as asthma, should avoid prolonged outdoor exertion; everyone else, especially children, should limit prolonged outdoor exertion';
  } else if (aqi > 100){
    aqiIndex.innerText = `${city}: ???? ${aqi} ????`;
    aqiLevelMessage.innerText = '???? Unhealthy for sensitive groups ????';
    heathImplications.innerText = 'Members of sensitive groups may experience health effects. The general public is not likely to be affected.'
    cautionaryStatement.innerText = 'Active children and adults, and people with respiratory disease, such as asthma, should limit prolonged outdoor exertion.';
  }else if (aqi > 50){
    aqiIndex.innerText = `${city}: ???? ${aqi} ????`;
    aqiLevelMessage.innerText = '???? Moderate ????';
    heathImplications.innerText = 'Air quality is acceptable; however, for some pollutants there may be a moderate health concern for a very small number of people who are unusually sensitive to air pollution.';
    cautionaryStatement.innerText = 'Active children and adults, and people with respiratory disease, such as asthma, should limit prolonged outdoor exertion.';
  } else if (aqi > 0){
    aqiIndex.innerText = `${city}: ???? ${aqi} ????`;
    aqiLevelMessage.innerText = '???? Good ???? ';
    heathImplications.innerText = 'Air quality is considered satisfactory, and air pollution poses little or no risk';
    cautionaryStatement.innerText = 'None';
  } else {
    errorLayout();
  }
}

// 
resetLayout = function(){
  aqiIndex.innerText = `???`;
  aqiLevelMessage.innerText = '???';
  heathImplications.innerText = '???';
  cautionaryStatement.innerText = '???';
}

//
errorLayout = function(){
  aqiIndex.innerText = `??????`;
  aqiLevelMessage.innerText = "Error: It seems there isn't an AQI Station in here. Check map to discover near Stations";
  heathImplications.innerText = '????';
  cautionaryStatement.innerText = '????';
}

//submit city name
searchForm.addEventListener('submit', function(e){
  e.preventDefault();
  currentCity = cityName.value;
  resetLayout();
  renderCity(currentCity);
});

//select all text when focus input text
cityName.addEventListener('focus', function(){
  cityName.select();
})

// Check AQI on clicked spot
//    marker on clicked spot
map.on('click', async function(e){

  let coords =  [e.latlng.lat, e.latlng.lng];
  marker.removeFrom(map);
  marker = L.marker(coords);
  marker.addTo(map);
  map.setView(coords);

//    get city name from coordinates of the clicked spot
  const res = (await getCity(coords)).json();
  const city = ((await res).results[0].components.county || (await res).results[0].components.state|| (await res).results[0].components.municipality );
  const flag = ((await res).results[0].annotations.flag);
  const formatted = ((await res).results[0].formatted);

//    add popup with info
  marker.bindPopup(`<b>${flag} - ${city}</b><br><b>${formatted}</b>`).openPopup();
})

// // Close popup when click outside the map
// window.addEventListener('click', function(){
//   marker.closePopup();
// })

startingPoint();