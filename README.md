# Expense Tracker 💰
A web application for you to readily find weather condition and forecast in Taiwan ☀️


### Trial in this project 🤠
**Open Weather Data**
+ Acquire data from [open API](https://opendata.cwb.gov.tw/index) provided by Central Weather Bureau in Taiwan


**Chart.js**
+ [Chart.js](https://www.chartjs.org/) is used to visualize data in beautiful chart

___

## Project First Look
![Application Screen Shot in GIF](taiwan-weather-api.gif)


## Features
| Functions              | Detail                                            |
| :--------------------: | ------------------------------------------------- |
| View current weather condition | User can find current weather condition, temperature, UVI, and probability of precipitation of each city |
| View weather forecast | 1. User can find weather forecast of a city in the next 36 hours on a table: weather condition, temperature, and probability of precipitation<br>2. User can find forecast of probability of precipitation of a city in the next 36 hours on a bar chart<br>3. User can find forecasted max and min temperature of a city in the next 36 hours on a line chart |


___

## Installation
The following instructions will get you a copy of the project and all the setting needed to run it on your local machine.


### Clone

Clone this repository to your local machine

```
$ git clone https://github.com/smallpaes/taiwan-weather-api.git
```


### Setup

**1. Create an account on Central Weather Bureau**
- [https://opendata.cwb.gov.tw/index](https://opendata.cwb.gov.tw/index)

**2. Get an API Key**

```
Login ->  會員資訊 -> API授權碼 -> 取得授權碼
```

**3. Enter the project folder**

```
$ cd taiwan-weather-api
```

**4. Fill in your API key in both local.js & index.js and save**

```
//In local.js & index.js find this variable and input your API key
const AUTHORIZE_CODE = <YOUR_API_KEY>
```

**5. Open index.html in your browser**

___

## Authors
[Mike Huang](https://github.com/smallpaes)
