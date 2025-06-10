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
                if(driver_result.value.password==password){

                    (req.session as any).username=username;
                    (req.session as any).userid=driver_result.value.id;

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

    }





};