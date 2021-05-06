//Returns aqi value of nearest station to user location
const aqiNearMe = async function(){
  try{
   const res = await fetch(`https://api.waqi.info/feed/here/?token=1a3e3d1e541f52ae2b24fc3036c9ca3902557c2d`)
   const resJson = await res.json();
   const city = resJson.data.city.name;
   const aqi = resJson.data.aqi;
   const message = aqiLevel(aqi);
   console.log(`Station closest to your position is: ${city}. AQI index is: "${aqi}: ${message}"`);
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
      throw new Error (`"${resJson.data}." Maybe look for closest station from you!`)
    }

    renderResJson(resJson.data.aqi);
  } catch (err) {
    console.error(err.message);
    aqiNearMe();
  }
}

//Associate aqi index to qualitative string level
aqiLevel = function(aqi){
  let message = '';
  if(aqi > 300){
    message = 'Hazardous!';
  } else if (aqi > 200){
    message = 'Very unhealthy';
  } else if (aqi > 150){
    message = 'Unhealthy';
  } else if (aqi > 100){
    message = 'Unhealthy for sensitive people';
  }else if (aqi > 50){
    message = 'Moderate';
  } else {
    message = 'Good';
  }
  return (message); 
}

//Render results
renderResJson = function(aqi){
  alert(aqi +': '+  aqiLevel(aqi));
  return aqi;
}

let city = prompt(`Cerchiamo l'indice AQI di quale città?`);
aqiCity(city);
