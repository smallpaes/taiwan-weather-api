(function () {
  let data = []
  const cityProfiles = document.getElementById('city-profiles')
  const dropdownMenu = document.querySelector('.dropdown-menu')
  const navBtn = document.querySelector('.navigation-btn')
  const BASE_URL = 'https://opendata.cwb.gov.tw/api/v1/rest/datastore/'
  const AUTHORIZE_CODE = '<YOUR_API_KEY>'
  const FORECAST = {
    dataid: 'F-D0047-091',
    format: 'JSON',
    //金門縣,嘉義市
    locationName: '宜蘭縣,花蓮縣,臺東縣,澎湖縣,連江縣,臺北市,新北市,桃園市,臺中市,臺南市,高雄市,基隆市,新竹縣,新竹市,苗栗縣,彰化縣,南投縣,雲林縣,嘉義縣,屏東縣',
    elementName: 'MinT,UVI,MaxT,PoP12h,Wx',
    startTime: ''
  }

  function displayDropDownMenu(data) {
    dropdownMenu.innerHTML = data.map(city => {
      return `
        <a class="dropdown-item text-secondary text-center" href="local.html" data-city='${city.locationName}'>${city.locationName}</a>
      `
    }).join('')
  }

  function displayNavigation(data) {
    const navigation = document.querySelector('.navigation-items')

    navigation.innerHTML += data.map(city => {
      return `
        <li><a href="#${city.locationName}" class='d-block'>${city.locationName}</a></li>
      `
    }).join('')
  }

  function convertDateTime(startTime, endTime) {
    const start = startTime.split(' ')[0].slice(5).split('-').join('/') + ' ' + startTime.slice(-8, -6) + '時'
    const end = endTime.split(' ')[0].slice(5).split('-').join('/') + ' ' + endTime.slice(-8, -6) + '時'
    return `${start} - ${end}`
  }

  function convertTime(startTime, endTime) {
    const start = startTime.slice(-8, -6) + '時'
    const end = endTime.slice(-8, -6) + '時'
    return `${start} - ${end}`
  }

  function getCurrentCityData(cityRawData, timeSlot) {
    const weatherElement = cityRawData.weatherElement
    const data = {}
    const startTime = cityRawData.weatherElement[0].time[timeSlot].startTime
    const endTime = cityRawData.weatherElement[0].time[timeSlot].endTime

    //convert date and time to proper format
    data['dateTime'] = convertDateTime(startTime, endTime)
    data['time'] = convertTime(startTime, endTime)

    //get values of other categories
    data.cityName = cityRawData.locationName
    weatherElement.forEach(function (category, index) {
      data[category.elementName] = weatherElement[index].time[timeSlot].elementValue[0].value
    })

    //get index value of weather condition
    data['WxValue'] = weatherElement[3].time[timeSlot].elementValue[1].value
    console.log(data)
    return data
  }

  function showUviLight(index) {
    let color = ''
    switch (true) {
      case index >= 0 && index <= 2:
        color = 'text-success'
        break
      case index <= 5:
        color = 'text-warning'
        break
      case index <= 7:
        color = 'text-orange'
        break
      case index <= 10:
        color = 'text-danger'
        break
      default:
        color = 'text-purple'
    }
    return `<i class="fas fa-lightbulb ${color}" data-toggle="modal" data-target="#uvi-table"></i>`
  }

  function showWeatherIcon(value) {
    if ((Number(value) > 22 && Number(value) < 29) || Number(value) > 30) { return }

    switch (true) {
      case Number(value) === 1:
        return `<i class="fas fa-sun"></i>`
      case Number(value) <= 3:
        return `<i class="fas fa-cloud-sun"></i>`
      case Number(value) <= 7:
        return `<i class="fas fa-cloud"></i>`
      default:
        return `<i class="fas fa-cloud-showers-heavy"></i>`
    }
  }

  function displayProfile(data) {
    cityProfiles.innerHTML = data.map(city => {
      const timeSlot = 0
      const cityData = getCurrentCityData(city, timeSlot)
      return `
      <!--${cityData.cityName}-->
      <div class="col-md-6 col-xl-4 mb-5 city" id='${cityData.cityName}'>
        <div class="card shadow">
          <figure>
            <img src="img/${cityData.cityName}.jpg" alt="Photo of ${cityData.cityName}" class="card-img-top" data-toggle="modal" data-target="#city-profile-detail" data-city='${cityData.cityName}'>
          </figure>
          <div class="card-body">
            <h5 class="card-title">${cityData.cityName}</h5>
            <p class="card-text">天氣概況：${showWeatherIcon(cityData.wxValue)} ${cityData.Wx}</p>
            <small class="text-muted font-italic">預測時間：${cityData.dateTime}</small>
          </div>
          <ul class="list-group list-group-flush">
            <li class="list-group-item">溫度：${cityData.MinT}&#176;C - ${cityData.MaxT}&#176;C</li>
            <li class="list-group-item">下雨機率：${cityData.PoP12h}</li>
            <li class="list-group-item">紫外線指數：${showUviLight(cityData.UVI)} ${cityData.UVI}</li>
          </ul>
          <div class="card-body text-center">
            <a href="#" class="card-link" data-toggle="modal" data-target="#city-profile-detail" data-city='${cityData.cityName}'>查看詳細天氣預測</a>
          </div>
        </div>
      </div>
    `
    }).join('')
  }

  function getWeatherForecast(name) {
    const forecastData = []
    const totalTimeSlots = 4
    const cityRawData = data.filter(city => city.locationName === name)[0]

    for (let i = 0; i < totalTimeSlots; i++) {
      forecastData.push(getCurrentCityData(cityRawData, i))
    }
    return forecastData
  }

  function displayProfileDetail(data) {
    const forecastDisplay = document.querySelector('.wx-forecast')
    const ModalTitle = document.getElementById('profileDetailLabel')
    const ModalImg = document.querySelector('#city-profile-detail img')

    //update Modal header
    ModalTitle.textContent = `${data[0].cityName}`

    //Update Modal Image
    ModalImg.src = `img/${data[0].cityName}.jpg`

    //display forecast detail
    forecastDisplay.innerHTML = data.map(item => {
      return `
      <div class='d-flex flex-column align-items-center'>
        <h3 class='mb-2'>${showWeatherIcon(item.WxValue)}</h3>
        <p>${item.Wx}</p>
        <p>${item.MaxT}&#176;C-${item.MinT}&#176;C</p>
        <p>${item.time}</p>
      </div>
    `
    }).join('')
  }

  //Get weather forecast data from API
  FORECAST_URL = `${BASE_URL}${FORECAST.dataid}?${AUTHORIZE_CODE}&format=${FORECAST.format}&locationName=${FORECAST.locationName}&elementName=${FORECAST.elementName}`
  axios
    .get(FORECAST_URL)
    .then(response => {
      data = response.data.records.locations[0].location
      console.log(data)
      displayDropDownMenu(data)
      displayNavigation(data)
      displayProfile(data)
    })
    .catch(error => console.log(error))

  //store city name in local storage to display on local.js
  dropdownMenu.addEventListener('click', event => {
    const cityName = event.target.dataset.city
    localStorage.setItem('displayCity', cityName)
    localStorage.setItem('allCityNames', FORECAST.locationName)
  })

  //show or hide dropdown list when button is clicked
  navBtn.addEventListener('click', () => {
    document.querySelector('.navigation-container').classList.toggle('navigation-show')
  })

  //click event listener to show detail forecast info of the city
  cityProfiles.addEventListener('click', event => {
    const cityName = event.target.dataset.city
    if (event.target.matches('[data-city]')) {
      const cityForecastData = getWeatherForecast(cityName)
      displayProfileDetail(cityForecastData)
    }
  })
})()