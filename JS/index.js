//constants and variables
const cityName = document.querySelector('.input-text');
const searchForm = document.querySelector('.search-form');

const aqiIndex = document.getElementById('aqi-index');
const aqiLevelMessage = document.getElementById('aqi-level');
const heathImplications = document.getElementById('health-implications');
const cautionaryStatement = document.getElementById('cautionary-statement');

const divmap = document.getElementById('mapid');
const aqiSec = document.querySelector('.aqi-sec');
const createDivmap = document.createElement('div');


let currentCity ='';

// get coordinates from city name
const getCoords = async function(city){
  let coordinates = fetch(`https://api.opencagedata.com/geocode/v1/json?q=${city}&key=33391df72f7d48e39576fde1f6b56d60`);
  const res = (await coordinates).json();
  const coords = (await res).results[0].geometry;
  const coordsArray = Object.values(coords);
  renderMap(coordsArray);
 }

const renderMap =  function (coords){
  const map = L.map('mapid').setView(coords, 6);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  L.tileLayer('https://tiles.aqicn.org/tiles/usepa-aqi/{z}/{x}/{y}.png?token=1a3e3d1e541f52ae2b24fc3036c9ca3902557c2d', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  
  L.marker(coords).addTo(map);

}



//Returns aqi value of nearest station to user location
const aqiNearMe = async function(){
  try{
   const res = await fetch(`https://api.waqi.info/feed/here/?token=1a3e3d1e541f52ae2b24fc3036c9ca3902557c2d`)
   const resJson = await res.json();
   const city = resJson.data.city.name;
   const aqi = resJson.data.aqi;
   alert(`Station closest to your position is: ${city}. AQI index is: "${aqi}"`);
   cityName.innerText = `${city}`;
  } catch (err){
    console.error(err.message); 
  }
}

//Returns aqi value of city's station
const aqiCity = async function (city){
  try {
    const res = await fetch(`https://api.waqi.info/feed/${city}/?token=1a3e3d1e541f52ae2b24fc3036c9ca3902557c2d`);
    const resJson = await res.json();
    if(resJson.status == 'error'){
      divmap.innerHTML = `Can't find the place, sorry!`;
      throw new Error (`"${resJson.data}."Maybe look for closest station from you!`)
    }
    renderResJson(resJson.data.aqi);
    getCoords(city);
  } catch (err) {
    console.error(err.message);
    errorLayout();
    aqiNearMe();
  }
}

//render result
renderResJson = function(aqi){
  if(aqi > 300){
    aqiIndex.innerText = `⚫ ${aqi} ⚫`;
    aqiLevelMessage.innerText = '💀 Hazardous! 💀';
    heathImplications.innerText = 'Health alert: everyone may experience more serious health effects';
    cautionaryStatement.innerText = 'Everyone should avoid all outdoor exertion';
  } else if (aqi > 200){
    aqiIndex.innerText = `🟤 ${aqi} 🟤`;
    aqiLevelMessage.innerText = '🚨 Very unhealthy 🚨';
    heathImplications.innerText = 'Health warnings of emergency conditions. The entire population is more likely to be affected.';
    cautionaryStatement.innerText = 'Active children and adults, and people with respiratory disease, such as asthma, should avoid all outdoor exertion; everyone else, especially children, should limit outdoor exertion.';
  } else if (aqi > 150){
    aqiIndex.innerText = `🔴 ${aqi} 🔴`;
    aqiLevelMessage.innerText = '🏭 Unhealthy 🏭';
    heathImplications.innerText = 'Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects';
    cautionaryStatement.innerText = 'Active children and adults, and people with respiratory disease, such as asthma, should avoid prolonged outdoor exertion; everyone else, especially children, should limit prolonged outdoor exertion';
  } else if (aqi > 100){
    aqiIndex.innerText = `🟠 ${aqi} 🟠`;
    aqiLevelMessage.innerText = '🌆 Unhealthy for sensitive groups 🌆';
    heathImplications.innerText = 'Members of sensitive groups may experience health effects. The general public is not likely to be affected.'
    cautionaryStatement.innerText = 'Active children and adults, and people with respiratory disease, such as asthma, should limit prolonged outdoor exertion.';
  }else if (aqi > 50){
    aqiIndex.innerText = `🟡 ${aqi} 🟡`;
    aqiLevelMessage.innerText = '🍂 Moderate 🍂';
    heathImplications.innerText = 'Air quality is acceptable; however, for some pollutants there may be a moderate health concern for a very small number of people who are unusually sensitive to air pollution.';
    cautionaryStatement.innerText = 'Active children and adults, and people with respiratory disease, such as asthma, should limit prolonged outdoor exertion.';
  } else if (aqi > 0){
    aqiIndex.innerText = `🟢 ${aqi} 🟢`;
    aqiLevelMessage.innerText = '🌿 Good 🌿 ';
    heathImplications.innerText = 'Air quality is considered satisfactory, and air pollution poses little or no risk';
    cautionaryStatement.innerText = 'None';
  } else {
    errorLayout();
  }
}

resetLayout = function(){
  aqiIndex.innerText = `⌛`;
  aqiLevelMessage.innerText = '⌛';
  heathImplications.innerText = '⌛';
  cautionaryStatement.innerText = '⌛';
  
}

errorLayout = function(){
  aqiIndex.innerText = `⚠️`;
  aqiLevelMessage.innerText = "Error: It seems there isn't an AQI Station in here. Check map to discover near Stations";
  heathImplications.innerText = '💤';
  cautionaryStatement.innerText = '💤';
}

//submit city name
searchForm.addEventListener('submit', function(e){
  e.preventDefault();
  currentCity = cityName.value;
  resetLayout();
  aqiCity(currentCity);
});

//select all text when focus input text
cityName.addEventListener('focus', function(){
  cityName.select();
})