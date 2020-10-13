$(document).ready(function(){
  //to get summary
  axios({
    method:'GET',
    url:'https://api.covid19api.com/summary',
    headers:{
      'access-control-allow-headers':'x-access-token',
      'X-Access-Token':'5cf9dfd5-3449-485e-b5ae-70a60e997864'
    }
  }).then((response) => {
    console.log(response.data);
    processData(response.data);
  })
  .catch((error)=>{
    console.error(error);
  })
});

//global variable to save the top 10 array list
var topTenArr = new Object();

//function to display summary of top 10 countries
function processData(data){
  var countries = data['Countries'];
  countries.sort(function(a, b) {
    return b['TotalConfirmed'] - a['TotalConfirmed'];
  });
  console.log("sorted",countries);
  countries = countries.splice(0,10);
  console.log("top 10",countries);

  //reload list
  $('#list').empty();
  //converting a date and display
  $('#date').html('Last updated '+new Date(data.Date));
  //add country wise data
  countries.forEach(country => {
    topTenArr[country.CountryCode] = country;
    addToDisplay(country);
  });  
  $('.collapsible').collapsible();
}

function addToDisplay(data){
  $('#list').append(`<li>
    <div class="collapsible-header" onclick="getDetails('`+data.Slug+`','`+data.CountryCode+`')">`+data.Country+` - `+data.TotalConfirmed+`</div>
    <div class="collapsible-body">
      <div class="row">
        <div class="col s12">
          <table class="responsive-table">
            <thead>
              <tr>
                <th></th>
                <th>Confirmed</th>
                <th>Deaths</th>
                <th>Recovered</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Total cases</td>
                <td class="blue-grey-text"><b>`+data.TotalConfirmed+`</b></td>
                <td class="red-text"><b>`+data.TotalDeaths+`</b></td>
                <td class="green-text"><b>`+data.TotalRecovered+`</b></td>
              </tr>
              <tr>
                <td>New cases</td>
                <td class="blue-grey-text"><b>`+data.NewConfirmed+`</b></td>
                <td class="red-text"><b>`+data.NewDeaths+`</b></td>
                <td class="green-text"><b>`+data.NewRecovered+`</b></td>
              </tr>
            </tbody>
          </table> 
        </div>
      </div>
      <div class="divider"></div>
      <div class="row" id="`+data.CountryCode+`|detail">
      <div class="progress">
        <div class="indeterminate"></div>
      </div>
      </div>                   
    </div>
  </li>`);
}

function getToday(){
  var dt = new Date();
  console.log(dt.toISOString());
  return dt.toISOString();
}

function getTenDaysAgo(){
  var dt = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
  console.log(dt.toISOString());
  return dt.toISOString();
}

//to get details for a country
function getDetails(slug,code){
  const url = "https://api.covid19api.com/dayone/country/"+slug;
  
  axios({
    method:'GET',
    url:url
  }).then((response) => {
    console.log(response.data);
    appendDetails(response.data);
    tabId = "#"+code;
    $('.tabs').each(function(){
      //if statement here 
      // use $(this) to reference the current div in the loop
      //you can try something like...
      $(this).tabs();
  
    });
  })
  .catch((error)=>{
    console.error(error);
  })
}

function getFormatedDate(dt){
  dt = new Date(dt);
  dt.setDate(dt.getDate() + 1);
  return dt.toLocaleString('en-CA', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function generateId(date){
  dt = new Date(date);
  months = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
  return months[dt.getMonth()]+dt.getDate();
}

function appendDetails(data){
  // to get details of last 10 days
  data = data.slice(Math.max(data.length - 10, 0));
  console.log(data);


  for(var i=0; i<10; i++){
    var entry = data[i];
    var next = data[i+1];
    if(i == 9){
      console.log(data[0].CountryCode,topTenArr)
      next = topTenArr[data[0].CountryCode];
      entry['newConfirm'] = "-";
      entry['newDeaths'] = "-";
      entry['newRecovered'] = "-";
      console.log(next.TotalConfirmed, entry.Confirmed)
    } else {
      entry['newConfirm'] = next.Confirmed - entry.Confirmed;
      entry['newDeaths'] = next.Deaths - entry.Deaths;
      entry['newRecovered'] = next.Recovered - entry.Recovered ;
    }
    console.log(entry);
  }
  data = data.slice().reverse();
  ths = "";
  row1 = "";
  row2 = "";
  row3 = "";
  row4 = "";
  data.forEach(entry => {
    var dt = getFormatedDate(entry.Date);
    console.log("got date for ",entry.Date," to ",dt);
    var id = generateId(entry.Date);
    ths += `<th>`+dt+`</th>`;
    row1 += `<td><span class="blue-grey-text text-darken-4"> `+entry.Active+`</span></td>`;
    row2 += `<td><span class="blue-grey-text"> `+entry.newConfirm+`</span></td>`;
    row3 += `<td><span class="red-text">`+entry.newDeaths+`</span></td>`;
    row4 += `<td><span class="green-text">`+entry.newRecovered+`</span></td>`;

  });
  divId= data[0].CountryCode+'|detail';

  //document.getElementById(divId).innerHTML = `<div class="col s12"><ul class="tabs z-depth-1" id="data[0].CountryCode">`+tabs+`</ul></div>`+divs;  

  var html = `<div class="col s12">
    <table class="responsive-table z-depth-1">
      <thead>
        <tr>
        <th></th>
          `+ths+`
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><b>Total Active</b></td>
          `+row1+`
        </tr>
        <tr>
          <td><b> New Confirmed <b></td>
          `+row2+`
        </tr>
        <tr>
          <td><b> New Deaths <b></td>
          `+row3+`
        </tr>
        <tr>
          <td><b> New Recovered <b></td>
          `+row4+`
        </tr>
      </tbody>
    </table> 
  </div>`;
  document.getElementById(divId).innerHTML = html;
}