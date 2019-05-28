(function () {
  //variables for charts
  let tempCanvasIsPainted = false
  let rainCanvasIsPainted = false

  //variables related to API
  let rawData = []
  let processedData = {}
  const BASE_URL = 'https://opendata.cwb.gov.tw/api/v1/rest/datastore/'
  const AUTHORIZE_CODE = 'Authorization=CWB-78AA3E18-AAFB-40E9-A97F-67E2E1CC1C91'
  const FORECAST = {
    dataid: 'F-D0047-091',
    format: 'JSON',
    locationName: '',
    backupLocationName: '臺北市, 新北市, 臺中市, 臺南市, 高雄市, 花蓮縣',
    elementName: 'MinT,UVI,MaxT,PoP12h,Wx,T',
    startTime: ''
  }

  //other variables
  const dropdownMenu = document.querySelector('.dropdown-menu')

  function displayDropDownMenu() {
    const allCityNames = localStorage.getItem('allCityNames') || FORECAST.backupLocationName
    dropdownMenu.innerHTML = allCityNames.split(',').map(city => {
      return `
        <a class="dropdown-item text-secondary text-center" href="local.html" data-city='${city}'>${city}</a>
      `
    }).join('')
  }

  function updateCover(cityName) {
    //update cover title
    document.querySelector('.cover-title').textContent = cityName
    //update cover photo
    document.querySelector('.cover-photo').style.backgroundImage = `url(img/${cityName}.jpg)`
  }

  function convertDateTime(time) {
    return time.slice(8, 10) + '日' + time.slice(-8, -6) + '時'
  }

  function showAnimation(targetCategory, targetNumber) {
    let currentNumber = 0
    function showTemperatureAnimation() {
      document.querySelector(targetCategory).textContent = currentNumber
      currentNumber += 1
      //stop animation when reaching target number
      if (currentNumber <= targetNumber) { return }
      clearInterval(animation)
    }
    const animation = setInterval(showTemperatureAnimation, 40)
  }

  function displayCurrentWeather(data) {
    //update weather condition icon
    document.querySelector('[data-current-wx]').innerHTML = `${showWeatherIcon(data.WxValue[0])}`
    //update temperature
    showAnimation('[data-current-temp]', data.T[0])
    //update raining percentage
    showAnimation('[data-current-pop]', data.PoP12h[0])
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

  function createWeatherCards(data, timeSlots) {
    const cards = []
    for (let i = 0; i < timeSlots; i++) {
      cards[i] = `
        <div class="card shadow-sm">
          <div class="card-header bg-secondary text-white">${data.timeSlot[i]}</div>
          <div class="card-body">
            <h2 class="card-title">${showWeatherIcon(data.WxValue[i])}</h2>
            <h6 class="card-title">${data.Wx[i]}</h6>
          </div>
          <ul class="list-group list-group-flush">
            <li class="list-group-item">溫度：${data.MinT[i]}&#176;C - ${data.MaxT[i]}&#176;C</li>
            <li class="list-group-item">下雨機率：${data.PoP12h[i]}%</li>
          </ul>
        </div>
      `
    }
    return cards
  }

  function createCarousel(cards, timeSlots, items) {
    let carousel = ''
    for (let i = 0; i < Math.ceil(timeSlots / items); i += 1) {
      carousel += `
        <div class="carousel-item">
            <div class="d-flex">
              ${cards.slice(i * 3, i * 3 + 3).join(' ')}
            </div>
        </div>
      `
    }
    return carousel
  }

  function displayWeatherForecast(data) {
    const ITEM_PER_DISPLAY = 3
    const displayTimeSlots = 6
    const forecastDisplay = document.querySelector('.forecast-display .carousel-inner')

    //create a card for each time slot
    const displayedCards = createWeatherCards(data, displayTimeSlots)
    //create carousel to display cards
    const carousel = createCarousel(displayedCards, displayTimeSlots, ITEM_PER_DISPLAY)
    //show carousel
    forecastDisplay.innerHTML = carousel
    //make the first slide of carousel be active
    forecastDisplay.children[0].classList.add('active')
  }

  function convertRawData(cityRawData) {
    console.log(cityRawData)
    const dataTypeAmount = cityRawData.length

    //get all forecast time slots
    processedData['timeSlot'] = cityRawData[0].time.map(timeSlot => convertDateTime(timeSlot.startTime))

    for (let i = 0; i < dataTypeAmount; i++) {
      processedData[cityRawData[i].elementName] = cityRawData[i].time.map(timeSlot => {
        return timeSlot.elementValue[0].value === ' ' ? null : timeSlot.elementValue[0].value
      }).filter(item => item)
    }

    //get index value of weather condition
    const wxResult = cityRawData.filter(category => category.elementName === 'Wx')
    processedData['WxValue'] = wxResult[0].time.map(timeSlot => timeSlot.elementValue[1].value)

    console.log(processedData)
    displayCurrentWeather(processedData)
    displayWeatherForecast(processedData)
  }

  //Get weather forecast data of the city
  function getCityData(name) {
    FORECAST.locationName = name
    FORECAST_URL = `${BASE_URL}${FORECAST.dataid}?${AUTHORIZE_CODE}&format=${FORECAST.format}&locationName=${FORECAST.locationName}&elementName=${FORECAST.elementName}`
    axios
      .get(FORECAST_URL)
      .then(response => {
        rawData = response.data.records.locations[0].location
        convertRawData(rawData[0].weatherElement)
        console.log(rawData)
      })
      .catch(error => console.log(error))
  }

  //Get city name to access city forecast data
  function getCityName() {
    const cityName = localStorage.getItem('displayCity') || '臺北市'
    updateCover(cityName)
    getCityData(cityName)
  }

  function drawTemperatureChart(dateData, highestTempData, lowestTempData) {
    //Temperature forecast chart
    let canvas = document.getElementById('temperatureChart').getContext('2d');
    let temperatureChart = new Chart(canvas, {
      // The type of chart we want to create
      type: 'line',

      // The data for our dataset
      data: {
        labels: dateData,
        datasets: [{
          label: '最高溫',
          fill: false,
          borderColor: 'rgb(255, 99, 132)',
          data: highestTempData,
          pointRadius: 4
        }, {
          label: '最低溫',
          fill: false,
          borderColor: 'green',
          data: lowestTempData,
          pointStyle: 'rectRot',
          pointRadius: 4
        }]
      },
      // Configuration options go here
      options: {
        animation: {
          duration: 2000,
          easing: 'easeOutCubic'
        },
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            padding: 25
          }
        },
        scales: {
          xAxes: [{
            gridLines: {
              display: false
            }
          }],
          yAxes: [{
            ticks: {
              callback: function (value, index, values) {
                return value + '°C'
              },
              suggestedMin: 10,
              suggestedMax: 35
            }
          }]
        }
      }
    })
  }

  function drawRainingPercentageChart(dateData, popData) {
    //Temperature forecast chart
    let canvas = document.getElementById('rainingChart').getContext('2d');
    let temperatureChart = new Chart(canvas, {
      // The type of chart we want to create
      type: 'bar',

      // The data for our dataset
      data: {
        labels: dateData,
        datasets: [{
          label: '白天',
          backgroundColor: function (context) {
            var index = context.dataIndex
            var value = context.dataset.data[index]
            return value < 30 ? 'rgba(78, 196, 161, .2)' :
              value < 60 ? 'rgba(226, 220, 61, .2)' : 'rgba(226, 61, 61, .2)'
          },
          // borderColor: 'rgba(78, 196, 161, 1)',
          borderWidth: 1,
          data: popData
        }]
      },

      // Configuration options go here
      options: {
        animation: {
          duration: 2000,
          easing: 'easeOutCubic'
        },
        legend: {
          display: false,
          position: 'bottom',
          labels: {
            padding: 25
          }
        },
        scales: {
          xAxes: [{
            gridLines: {
              display: false
            }
          }],
          yAxes: [{
            ticks: {
              callback: function (value, index, values) {
                return value + '%'
              },
              suggestedMin: 0,
              suggestedMax: 100
            }
          }]
        }
      }
    })
  }

  //get all city name for dropdown menu
  displayDropDownMenu()

  //get city name for local storage
  getCityName()

  //force the page to scroll to the top when refreshed or loaded
  window.addEventListener('beforeunload', () => window.scrollTo(0, 0))

  //store city name in local storage to display on local.js
  dropdownMenu.addEventListener('click', event => {
    const cityName = event.target.dataset.city
    localStorage.setItem('displayCity', cityName)
  })

  //show each chart only when it comes into the viewport
  window.addEventListener('scroll', () => {
    //select canvas in HTML
    let temperatureCanvas = document.getElementById('temperatureChart')
    let rainingCanvas = document.getElementById('rainingChart')
    let bottomPosition = window.scrollY + window.innerHeight
    //show temperature forecast chart
    if (bottomPosition >= temperatureCanvas.offsetTop && !tempCanvasIsPainted) {
      tempCanvasIsPainted = true
      drawTemperatureChart(processedData.timeSlot, processedData.MaxT, processedData.MinT)
    }
    //show raining percentage forecast chart
    if (bottomPosition >= rainingCanvas.offsetTop && !rainCanvasIsPainted) {
      rainCanvasIsPainted = true
      const displayedDate = processedData.timeSlot.slice(0, processedData.PoP12h.length)
      drawRainingPercentageChart(displayedDate, processedData.PoP12h)
    }
  })
})()