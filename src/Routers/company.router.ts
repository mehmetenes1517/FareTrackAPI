import express,{ Request, Response, Router } from "express";
import { DriverLoginService } from "../Services/driver.login.service";
import { CompanyLoginService } from "../Services/company.login.service";
import { Company } from "../Models/company.model";
import { Result } from "../Models/result.model";
import { createHash } from "crypto";
import { Driver } from "../Models/driver.model";
import { TripsService } from "../Services/trips.service";
import { Trip } from "../Models/trip.model";
import { GPSService } from "../Services/gps.service";
import { Location } from "../Models/location.model";
import { WalletService } from "../Services/wallet.service";
import { Wallet } from "../Models/wallet.model";

export class CompanyRouter{
    private router:Router;
    private company_loginservice:CompanyLoginService;
    private walletservice:WalletService;
    private driver_loginservice:DriverLoginService;
    private tripservice:TripsService;
    private gpsservice:GPSService;
    constructor(company_loginservice:CompanyLoginService,driver_loginservice:DriverLoginService,tripsService:TripsService,gpsservice:GPSService,walletservice:WalletService){
        this.router=express.Router();
        this.company_loginservice=company_loginservice;
        this.driver_loginservice=driver_loginservice;
        this.tripservice=tripsService;
        this.gpsservice=gpsservice;
        this.walletservice=walletservice;
        this.SetupRoutes();
    }
    GetRouter():Router{return this.router;}
    private SetupRoutes(){


        this.router.post("/logincompany",async (req:Request,res:Response)=>{

            let {username,password} = req.body;

            let company_result:Result<Company>=await this.company_loginservice.FindOneUsername(username);
            if(company_result.success){
                password=createHash("sha512").update(password).digest("hex");
                if(company_result.value.password==password){
                    (req.session as any).companyid=company_result.value.id;
                    (req.session as any).companyname=company_result.value.username;
                    (req.session as any).roleid=0;

                    res.status(200).send(company_result.value);
                }
            }else{
                res.status(401).send("User cannot be found");
            }

        });
        this.router.post("/createcompany",async (req:Request,res:Response)=>{

            let {companyname,username,password,email,phone} = req.body;

            let created_company:Result<Company>=await this.company_loginservice.AddOne(companyname,username,password,email,phone);
            
            if(created_company.success){
                
                let wallet:Result<Wallet>=await this.walletservice.AddOne(created_company.value.id,0,0);
                if(wallet.success){
                    (req.session as any).companyid=created_company.value.id;
                    (req.session as any).companyname=created_company.value.username;
                    (req.session as any).roleid=0;   
                    res.status(200).send(created_company.value);
                }else{
                    res.status(401).send("Wallet Cannot be created");
                }
            }else{
                res.status(401).send("User Cannot be created");
            }

        });
        this.router.get("/getdrivers",async(req:Request,res:Response)=>{
            let {companyid,companyname,roleid} = req.session as any;
            if(companyid && companyname && roleid==0){

                let drivers_result:Result<Driver[]>=await this.driver_loginservice.FindManyCompanyID(companyid);
                if(drivers_result.success){
                    res.status(200).send(drivers_result.value);
                }else{
                    res.status(401).send("Cannot Found");
                }

            }else {
                res.status(401).send("Authorization Required");
            }
        });
        this.router.get("/getdriverlocations", async (req:Request,res:Response)=>{
            let {companyname,companyid,roleid}=req.session as any;
            if(companyid && companyname && roleid==0){
                let drivers_:Result<Driver[]>=await this.driver_loginservice.FindManyCompanyID(companyid);
                let ids:number[]=[];
                if(drivers_.success){
                    for(let i=0;i<drivers_.value.length;i++){
                        ids.push(drivers_.value[i].id);
                    }
                    let locations:Location[]=[];
                    for (let i = 0; i < ids.length; i++) {
                        let val:Result<Location>=await this.gpsservice.FindOneDriverID(ids[i]);
                        if(val.success){
                            locations.push(val.value);
                        }
                    }
                    res.status(200).send(locations);
                }else{
                    res.status(401).send("Authorization Required");
                }
            }else{
                res.status(401).send("Authorization Required");
            }
        });
        this.router.post("/createdriver",async (req:Request,res:Response)=>{
            let {companyid,companyname,roleid}=req.session as any;
            if(companyid && companyname && roleid==0){

                let {username,password,email,busid} = req.body;
                
                let driver_result:Result<Driver>=await this.driver_loginservice.AddOne(companyid,true,username,email,password,busid);
                if(driver_result.success){
                    res.status(200).send("OK");
                }else{
                    res.status(401).send("User Cannot be created");
                }
            }else{
                res.status(401).send("Authorization Required");
            }
        });
        this.router.get("/gettrips",async (req:Request,res:Response)=>{
            let {companyname,companyid,roleid}=req.session as any;
            if(companyid && companyname && roleid==0){
                let trips:Result<Trip[]>=await this.tripservice.FindManyCompanyID(companyid);
                if(trips.success){
                    res.status(200).send(trips.value);
                }else{
                    res.status(500).send("Error");
                }
            }else{
                res.status(401).send("Authorizaiton Required");
            }
        });
    }
};