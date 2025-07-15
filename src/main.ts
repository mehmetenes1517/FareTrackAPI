import express from "express"
import cors from "cors"
import { WalletService } from "./Services/wallet.service";
import { UserRouter } from "./Routers/user.router";
import session from "express-session";
import { DriverRouter } from "./Routers/driver.router";
import { DriverLoginService } from "./Services/driver.login.service";
import { UserLoginService } from "./Services/user.login.service";
import { CompanyRouter } from "./Routers/company.router";
import { CompanyLoginService } from "./Services/company.login.service";
import { TransactionService } from "./Services/transactions.service";
import { TripsService } from "./Services/trips.service";
import { GPSService } from "./Services/gps.service";
import { NFCService } from "./Services/nfc.service";
const app=express();


const user_router=new UserRouter(new UserLoginService(),new WalletService(),new TransactionService(),new GPSService());
const driver_router=new DriverRouter(new DriverLoginService(),new TripsService(),new GPSService(),new NFCService(new CompanyLoginService(),new DriverLoginService(),new UserLoginService(),new TripsService(),new TransactionService(),new WalletService()));
const company_router=new CompanyRouter(new CompanyLoginService(),new DriverLoginService(),new TripsService(),new GPSService(),new WalletService());


app.use(express.json());
app.use(cors({
    credentials:true
}));
app.use(session({
    secret:process.env.secret_key as string,
    resave:false,
    saveUninitialized:false,
    cookie:{
        maxAge:60000 * 60 // 1 hour i guess (?) 
    }
}));



app.use("/UserAPI",user_router.GetRouter());
app.use("/DriverAPI",driver_router.GetRouter());
app.use("/CompanyAPI",company_router.GetRouter());


app.listen(process.env.PORT,()=>console.log(`Server is listening port ${process.env.PORT}`))
