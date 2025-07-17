  Fare Track API 

If you Setup a Database for API you need to enter the root directory of the project and execute this command
      
    npm run seed

after this command you had been created a empty database for api

Then you need to create a '.env' file for the environment variables

VARIABLE | Description
--- | ---
PORT | The Port that api will work
secret_key | The Secret key for the session cookie encription

Create a .env file and asssign values to these variables

example assignment for the variables 

    PORT=1200
    secret_key='secret123'

Finally you must execute this command to start the api

    npm run start







  ROUTES FOR THE API
-------------------------------------------------------------------------

  Route | SubRoute | Method Type | JSON Object Parameters | Session Required | Description 
--- | --- | --- | --- | --- |--- 
/UserAPI | /createuser | POST | username,password,email,phone | NO | Creates A user and a wallet belongs to him/her And Creates a session cookie in the browser  
/UserAPI | /loginuser | POST | username,password | NO | Creates a session cookie if the informations are correct
/UserAPI | /deleteuser | DELETE | None | YES | Deletes the user from the database and its informations ( wallet , transactions etc..)
/UserAPI | /updateuser | PUT | username,password,email,phone | YES | Updates the user informations
/UserAPI | /addmoney | PUT | amount | YES | Adds the amount of money you entered to the user in the browser with session information
/UserAPI | /withdrawmoney | PUT | amount | YES | Withdraws the amount of money you entered to the user in the browser
/UserAPI | /getuser | GET | None | YES | returns the user informations of the user who is saved the session cookie in the browser
/UserAPI | /gettransactions | GET | None | YES | returns the transaction informations of the user who is saved the session cookie in the browser
/UserAPI | /getwallet | GET | None | YES | returns the wallet informations of the user who is saved the session cookie in the browser
/UserAPI | /sharelocation | POST | longtitude,latitude,time | YES | saves the location of the user who is saved to the browser with session cookie to database
/UserAPI | /getlocation | GET | None | YES | returns the location of the user who is saved to the browser with session cookie

  Route for the QR payment System
 Route | SubRoute | Method | Session Required | Description
 --- | --- | --- | --- | --- |
/UserAPI | /qrpayment/:driverid/:from/:to/:time/:price | GET | YES | Provides a Qr payment system with simple url


-------------------------------------------------------------------------


 Route | SubRoute | Method Type | JSON Object Parameters | Session Required | Description 
--- | --- | --- | --- | --- |--- 
/DriverAPI | /logindriver | POST | username,password | NO | Creates a session cookie and saves it to the browser
/DriverAPI | /activate | PUT | None | YES | Activates the driver which is saved in the browser with session cookie
/DriverAPI | /deactivate | PUT | None | YES | Deactivates the driver which is saved in the browser with session cookie
/DriverAPI | /getdriver | GET | None | YES | Returns the driver which is saved in the browser with session cookie
/DriverAPI | /gettrips | GET | None | YES | Returns the trips of the driver which is saved in the browser with session cookie
/DriverAPI | /sharelocation | POST | longtitude,latitude,time | YES | shares the location of the driver which is saved in the browser with session cookie
/DriverAPI | /getlocation | GET | None | YES | Returns the location of the driver which is saved in the browser with session cookie
/DriverAPI | /nfcpayment | POST | userid,from,to,time,price | YES | Provides a Nfc payment system that withdraws money from user account and Adds money into Wallet of Company of the driver

-------------------------------------------------------------------------

 Route | SubRoute | Method Type | JSON Object Parameters | Session Required | Description 
--- | --- | --- | --- | --- |--- 
/CompanyAPI | /logincompany | POST | username,password | NO | Creates a session cookie and saves it to the browser
/CompanyAPI | /createcompany | POST | username,password,email,phone | NO | Creates a company account and saves it to database
/CompanyAPI | /getdrivers | GET | None | YES | Returns all drivers the company have 
/CompanyAPI | /getdriverlocations | GET | None | YES | Returns all last driver locations
/CompanyAPI | /gettrips | GET | None | YES | Returns all the trips of the drivers of the company
/CompanyAPI | /createdriver | POST | username,password,email,busid | NO | Creates a driver belongs to company















