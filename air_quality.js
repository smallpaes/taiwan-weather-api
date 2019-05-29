const ctx = document.getElementById('aqi-test').getContext('2d');
const currentAqis = document.querySelectorAll('.current-aqi-item canvas')
const forecastAqis = document.querySelectorAll('.forecast-aqi-item canvas')


function createDoughnutChart(canvas) {
  var chart = new Chart(canvas, {
    // The type of chart we want to create
    type: 'doughnut',

    // The data for our dataset
    data: {
      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
      datasets: [{
        label: 'My First dataset',
        backgroundColor: 'rgb(255, 99, 132)',
        borderColor: 'rgb(255, 99, 132)',
        data: [0, 10, 5, 2, 20, 30, 45]
      }]
    },

    // Configuration options go here
    options: {
      legend: {
        display: false,
        position: 'bottom',
        labels: {
          padding: 25
        }
      }
    }
  });
}

function createLineChart(canvas) {
  var chart = new Chart(canvas, {
    // The type of chart we want to create
    type: 'line',

    // The data for our dataset
    data: {
      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
      datasets: [{
        label: 'My First dataset',
        backgroundColor: 'rgb(255, 99, 132)',
        borderColor: 'rgb(255, 99, 132)',
        data: [0, 10, 5, 2, 20, 30, 45]
      }]
    },

    // Configuration options go here
    options: {
      legend: {
        display: false,
        position: 'bottom',
        labels: {
          padding: 25
        }
      }
    }
  });
}


currentAqis.forEach(canvas => createDoughnutChart(canvas))
forecastAqis.forEach(canvas => createLineChart(canvas))