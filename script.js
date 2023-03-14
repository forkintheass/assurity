import http from 'k6/http';
import { sleep } from 'k6';
import { check } from 'k6';
import file from 'k6/x/file';
import { Trend } from 'k6/metrics';
import exec from 'k6/execution';
import { randomItem } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js'

// arrays of global data used in the test: these are different categories
const category_id = ['6327', '6328', '6329', '6330', '6331', '6332', '6333', '6334', '6335', '6336'];

//dynamic output filename taken from iso-standard date, with special symbols substituted, so no issues happen in different OS. You can substitute to static one
const filepath = new Date().toISOString().replace(/[:.]/g,'-').slice(0,-5) + '.csv';

// rps we need to support according to the task. You can change it here.
const defined_rps = 10;

// per definition, we need to support 'Vusers (Threads) half the count of Category IDs shared in Test Data'.
// you can substitute this rounded-down calculation to any number.
const vu_qty = Math.floor(category_id.length / 2);

// array of successful request status, with which received status will be compared 
const ok_status = [200, 201, 202, 203, 204, 205, 206, 207, 208, 226];

//this block defines options of the test that will be used by k6 engine
export const options = {

  scenarios: {
    constant_request_rate: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { target: vu_qty, duration: vu_qty+'s' }, //first stage to grow vu 1 per second
        { target: vu_qty, duration: '60s' }, // steady stage
        { target: 0, duration: '2s' }, // graceful shutdown, you can change duration for that or remove 
      ],
    },
  },

// this is the threshold which will be analyzed, requested by reqs.
  thresholds: {
    http_req_duration: ['p(90)<500.001'],
  },
};

// section below is the main test code, which will be executed by each vu.
export default async function () {

  const random_category = randomItem(category_id); // randomly select category to put it into url.

  const response = http.get(`https://api.tmsandbox.co.nz/v1/Categories/${random_category}/Details.json?catalogue=false`);

// next piece of code is to gather id and price of promotions; they are gathered consequently: id#,price#,id#,price#...
// some of the requests may not contain promotions, so we need to handle.
  const id_price = []

  if (response.json('Promotions.#.Id') === undefined) {
   } else {
      for (let i = 0; i < response.json('Promotions.#.Id').length; i++) {
      id_price.push('id:'+response.json('Promotions.#.Id')[i]);
      id_price.push('price:'+response.json('Promotions.#.Price')[i]);
      }
    }

// write data into output csv file
  file.appendString(filepath, 
    new Date().toISOString()+","+ // date in ISO format, GMT
    response.timings.duration+","+ // response time, this is K6 property
    response.json('CategoryId')+","+ // categoryID from JSON response
    response.json('Name')+","+ // Name from JSON response
    response.json('Path')+","+ // Path from JSON response
    id_price+"\n" // previously constructed array of id and price of promotions
    );

// checks implemented with native k6 methods.
  const res_code = check(response, {
  	'is status ok': (r) => ok_status.includes(r.status),
  });

//if response wasn't successful, we don't check its data further.
  if (res_code) {
    const res_check = check(response, {
  	'CanRelist=true?': (r) => r.body.includes('"CanRelist":true'),
  	'is CategoryId proper?': (r) => r.json('CategoryId') == random_category,
  	 },	
    );
  }

// since we use ramp-up executor, we need to set delay between requests, 
// as in this executor vu will send as much requests as it can, one by one.
// delay is calculated as dif between time that is available to perform the request
// and how much time request really taken. 
// For example, if we have to issue 50 rps by 10 vu, then each request should
// not take more than 200ms. If the response is 150ms, we have to add 50ms delay 
// to be on desired schedule.

// sleep is native k6 method defined in seconds.
const sleep_time = 1 / (defined_rps/vu_qty) - response.timings.duration/1000;

// if we are behind schedule, then sleep should be 0; we will put message about that.
if (sleep_time < 0) {
  sleep(0);
  console.log('probably there is not enough vu to request necessary rate')
} else {
  sleep(sleep_time);
}

// some service output to see the progress. the entire block may be ommitted.
console.log(new Date().toISOString()+
            ' VU: '+exec.instance.vusActive+
            ' category: '+response.json('CategoryId')+
            ' rt: '+response.timings.duration);


}

// this block exports summary to the html file and to the stdout at the same time.
export function handleSummary(data) {

  console.log('Test report has been exported to: report.html ');
  console.log('Raw data has been put into: '+filepath)

  return {
    'report.html': htmlReport(data),
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
  };
  
}
