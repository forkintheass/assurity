
# Assurity Consulting 
Performance test as a technical assignment for Assurity Consulting

## Table Of Content

- [Overall description](#overall-description)
- [Original task listing](#original-task-listing)

# Assumptions, contraints and remarks
Numerous assumptions were made for this technical assignment.
## Environment
- Please ensure
- dfsdfsdf
## Test design remarks
I feel that some of the test design specifications provided may be seen ambigous and I would like to highlight ones.
- _Print following values in a csv file: Category ID, Name, Path, Promotion ID, Price_

It's not clear if this CSV file should contain requested fields **only** or additional info, such as timestamp and response time, can be added. If I am to implement requirements "as is", there should be this file and another file with other data I want to collect. It seems to be an overkill a bit, so I forced myself to read that requirement as "at least" and included other necessary info into output CSV.

- Test assertion

It's not clear from the description if the requests with 2XX response but not passing two other criterias, should be considered as wrong and thrown out of results. I supposed that everything with the 2XX code has processed correctly by the server and is of interest for the test results.

- Virtual users / threads concept

For a lot of performance testing tools virtual user is a concept equal to thread. It means that a VU is limited by 1/(RT) requests per second, where RT is average response time from server including downloading the response. In order to make fixed quantity of requests not depending on response wait, we have to use more than one thread per VU, e.g. if VU has to send 2 requests per second, second thread will be sending the request in scheduled time even if first thread waits for the server's reply for 1.5s. 

K6 has this limitation, too, so if server is replying slowly, K6 simply could not reach 10 requests per second with insufficient quantity of VUs. In our conditions with the requirement of 5 VUs and requirement of 10 requests per sec, server should reply in less than 500ms so we can accomodate necessary rate.

### Overall description

**Note:** 

## Original task listing

**Functional Requirements:**
- API: https://api.tmsandbox.co.nz/v1/Categories/6327/Details.json?catalogue=false 
- Test Data: (Category ID: 6327, 6328, 6329, 6330, 6331, 6332, 6333, 6334, 6335, 6336)

**Test Assertion:**
- Check for the Response Status
- On a successful response, validate the response with below criteria:
- Parameter Check: Category ID
- Text Check: "CanRelist": true
- Print following values in a csv file: Category ID, Name, Path, Promotion ID, Price
- Please print all Promotion IDs and respective Prices per Category ID

**Non-Functional Requirements**
- NFR-01 Test should support Vusers (Threads) half the count of Category IDs shared in Test Data
- NFR-02 The test should ramp up at one VUser (Thread) per second
- NFR-03 Test should achieve 10 API calls in total for the 1-minute Steady State duration
- NFR-04 90 percent of the times the API is expected to perform within 500 ms

**Performance Test Execution:**
- The test execution parameters should allow for changing ramp-up, steady state, throughput and VUser (Thread) count.

**Performance Test Reporting:**
Prepare a performance test report explaining the purpose, observations you made from your local runs, and other commentary as you deem fit.

**Instructions:**
- Ensure you include a clear ReadMe (markdown file in source repo) for all the steps that lets us execute and review the script and any supporting files. (It must be submitted in a public repository like Bitbucket or GitHub)
- Make sure any assumptions made are included in the ReadMe file.
- Your test must meet all the requirements specified

**Scripting:**
- API call can be made using any open-source performance test tool of your choice
- Test Assertion must be written code in a scripting language of your choice, but compatible with the performance test tool selected.

**Performance Test Reporting:**
- Test executions carried out by you & the instructions you share should be for a non-GUI test run if the tool supports it.

**Performance Test Report:**
- Attach the test raw data file in the source repo.
- The report should be written in ReadMe (markdown file in source repo).
- The report should include the commentary and supporting evidence where applicable.
- Additional report formats can be added for reference to the source repo (Non inclusion of additional formats will not lead to negative marking, however, will be given points for the effort if included)
- Points will be awarded for meeting the criteria, style and the use of good practices and appropriate use of source control.
We want to see your best work - no lazy coding or comments.
