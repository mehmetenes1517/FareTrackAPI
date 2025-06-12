import express,{ Request, Response, Router } from "express";
import { DriverLoginService } from "../Services/driver.login.service";
import { Result } from "../Models/result.model";
import { Driver } from "../Models/driver.model";
import { createHash } from "crypto";

export class DriverRouter{
    private loginservice:DriverLoginService;
    private router:Router;
    
    constructor(loginservice:DriverLoginService){
        this.loginservice=loginservice;
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
                console.log(driver_result.value.password);
                console.log(password);
                if(driver_result.value.password==password){

                    (req.session as any).drivername=username;
                    (req.session as any).driverid=driver_result.value.id;

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
            let {drivername,driverid} = req.session as any;
            if(drivername && driverid){
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
            let {drivername,driverid} = req.session as any;
            if(drivername && driverid){
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
    }





};