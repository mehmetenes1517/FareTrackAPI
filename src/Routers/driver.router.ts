import express,{ Request, Response, Router } from "express";
import { DriverLoginService } from "../Services/driver.login.service";
import { Result } from "../Models/result.model";
import { Driver } from "../Models/driver.model";
import { createHash } from "crypto";
import { TripsService } from "../Services/trips.service";
import { Trip } from "../Models/trip.model";
import { GPSService } from "../Services/gps.service";
import { Location } from "../Models/location.model";
import { NFCService } from "../Services/nfc.service";

export class DriverRouter{
    private loginservice:DriverLoginService;
    private router:Router;
    private tripservice:TripsService;
    private gpsservice:GPSService;
    private nfcservice:NFCService;
    constructor(loginservice:DriverLoginService,tripservice:TripsService,gpsservice:GPSService,nfcservice:NFCService){
        this.loginservice=loginservice;
        this.tripservice=tripservice;
        this.gpsservice=gpsservice;
        this.nfcservice=nfcservice;
        this.router=express.Router();
        this.SetupRoutes();
    }
    GetRouter():Router{
        return this.router;
    }
    SetupRoutes(){

        this.router.post("/logindriver", async (req:Request,res:Response)=>{
            let {username,password}=req.body;
            let driver_result:Result<Driver> = await this.loginservice.FindOneUsername(username);
            if(driver_result.success){
                
                password=createHash("sha512").update(password).digest("hex");
                if(driver_result.value.password==password){

                    (req.session as any).drivername=username;
                    (req.session as any).driverid=driver_result.value.id;
                    (req.session as any).roleid=1;

                    res.status(200).send("User Logged in");
                    return;
                }else{
                    res.status(401).send("Wrong Info");
                    return;
                }

            }else{
                res.status(401).send("There is no user")
                return;
            }
        });
        this.router.put("/activate",async (req:Request,res:Response)=>{
            let {drivername,driverid,roleid} = req.session as any;
            if(drivername && driverid && roleid==1){
                let res_activation:Result<boolean>=await this.loginservice.ActivateOne(driverid);
                if(res_activation.success){
                    res.status(200).send("OK");
                }else{
                    res.status(401).send("Authorization Required");
                }
            }else{
                res.status(401).send("Authorization Required");
            }
        });
        this.router.put("/deactivate",async (req:Request,res:Response)=>{
            let {drivername,driverid,roleid} = req.session as any;
            if(drivername && driverid && roleid==1){
                let res_activation:Result<boolean>=await this.loginservice.DeactivateOne(driverid);
                if(res_activation.success){
                    res.status(200).send("OK");
                }else{
                    res.status(401).send("Authorization Required");
                }
            }else{
                res.status(401).send("Authorization Required");
            }
        });
        this.router.get("/getdriver",async (req:Request,res:Response)=>{
            let {driverid} = req.session as any;
            if(driverid){   
                let driver_:Result<Driver>=await this.loginservice.FindOneID(driverid);
                if(driver_.success){
                    res.status(200).json(driver_.value);
                }else{
                    res.status(401).send("There is no such a user");
                }
            }else{
                res.status(401).send("Authorization Required");
            }
        });
        this.router.get("/gettrips",async (req:Request,res:Response)=>{
                    let {drivername,driverid,roleid}=req.session as any;
                    if(driverid&&drivername&&roleid==1){
                        let trips:Result<Trip[]>=await this.tripservice.FindManyDriverID(driverid);
                        if(trips.success){
                            res.status(200).send(trips.value);
                        }else{
                            res.status(500).send("Error");
                        }
                    }else{
                        res.status(401).send("Authorizaiton Required");
                    }
        });
        this.router.post("/sharelocation",async (req:Request,res:Response)=>{
                            let {driverid,drivername,roleid}=req.session as any;
                            if(driverid && drivername && roleid==1){
                                let {longtitude,latitude,time} = req.body;
                                let user:Result<Driver>=await this.loginservice.FindOneID(driverid);
                                if(user.success){
                                    let location :Result<Location>= await this.gpsservice.FindOneDriverID(driverid);
                                    if(location.success){
                                        let loc_update:Result<Location>=await this.gpsservice.UpdateOneDriver(driverid,longtitude,latitude,time);
                                        res.status(200).send(loc_update.value);
                                    }else{
                                        let loc_add:Result<Location>=await this.gpsservice.AddOneDriver(driverid,longtitude,latitude,time);
                                        res.status(200).send(loc_add.value);
                                    }
                                }else{
                                    res.status(401).send("User Cannot be Found");
                                }
                            }else{
                                res.status(401).send("Authorization Required");
                            }
                
                        });
        this.router.get("/getlocation",async (req:Request,res:Response)=>{
            let {drivername,driverid,roleid} = req.session as any;
            if(driverid && drivername && roleid==1){
                let location :Result<Location> =await this.gpsservice.FindOneDriverID(driverid);
                if(location.success){
                    res.status(200).send(location.value);
                }else{
                    res.status(401).send("Authorization Required");
                }
            }else{
                res.status(401).send("Authorization Required");
            }

        });
        this.router.post("/nfcpayment",async (req:Request,res:Response)=>{

            let {driverid,userid,from,to,time,price}=req.body;
            if(driverid && userid){

                let res_:Result<string>=await this.nfcservice.MakePayment(driverid,userid,from,to,time,price);
                if(res_.success){
                    res.status(200).send("Payment Success");
                }else{
                    res.status(401).send("Authorization Required");
                }
            }else{
                res.status(401).send("Authorization Required");
            }

        });
        this.router.get("/qrpayment",async (req:Request,res:Response)=>{

            let {code} =req.params;
            //CODE = >  driverid:userid:from:to:time:price

            let array_code:any[]=code.split(":");
            
            let driverid:number=array_code[0];
            let userid:number=array_code[1];
            let from:string=array_code[2];
            let to:string=array_code[3];
            let time:string=array_code[4];
            let price:number=array_code[5];

            if(driverid && userid){

                let res_:Result<string>=await this.nfcservice.MakePayment(driverid as number,userid,from,to,time,price);
                if(res_.success){
                    res.status(200).send("Payment Success");
                }else{
                    res.status(401).send("Authorization Required");
                }
            }else{
                res.status(401).send("Authorization Required");
            }

        });
    }





};