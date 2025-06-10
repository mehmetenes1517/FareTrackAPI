import express,{ Router } from "express";
import { DriverLoginService } from "../Services/driver.login.service";

export class DriverRouter{
    private loginservice:DriverLoginService;
    private router:Router;
    
    constructor(loginservice:DriverLoginService){
        this.loginservice=loginservice;
        this.router=express.Router();
    }
    GetRouter():Router{
        return this.router;
    }






};