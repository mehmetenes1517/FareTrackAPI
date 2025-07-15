import { Database, open } from "sqlite";
import sqlite3 from "sqlite3";
import { Result } from "../Models/result.model";
import { Trip } from "../Models/trip.model";
import { Driver } from "../Models/driver.model";
import { DriverLoginService } from "./driver.login.service";

export class TripsService{
    private db:Database;
    private driverservice:DriverLoginService;
    constructor(){
        this.driverservice=new DriverLoginService();
        this.SetupDB();
    }
    private async SetupDB(){
        this.db=await open({
            filename:"main.db",
            driver:sqlite3.Database
        });
    }
    public async FindOneID(id:number):Promise<Result<Trip>>{
        let trip=await this.db.get(`SELECT * FROM trips WHERE id=${id}`);
        if(typeof trip == "undefined"){
            return new Promise(e=>e({success:false,value:{} as Trip}))
        }else{
            return new Promise(e=>e({success:true,value:trip}));
        }
    }
    public async FindManyDriverID(driverid:number):Promise<Result<Trip[]>>{
        let trip=await this.db.all(`SELECT * FROM trips WHERE driverid=${driverid}`);
            return new Promise(e=>e({success:true,value:trip}));
    }
    public async FindManyCompanyID(companyid:number):Promise<Result<Trip[]>>{
        let trip=await this.db.get(`SELECT * FROM trips WHERE companyid=${companyid}`);
        return new Promise(e=>e({success:true,value:trip}));
    }
    public async InsertOne(driverid:number,from:string,to:string,price:number,time:string):Promise<Result<Trip>>{
        let driver_result:Result<Driver> = await this.driverservice.FindOneID(driverid);
        if(driver_result.success){    
            await this.db.exec(`INSERT INTO trips (companyid,driverid,from_,to_,price,time) 
                VALUES(
                     ${driver_result.value.companyid},
                     ${driverid},
                    '${from}',
                    '${to}',
                     ${price},
                    '${time}');`
            );
            return new Promise(e=>e({success:true,value:{driverid:driverid,from:from,to:to,price:price,time:time} as Trip}));
        }
        else{ 
            return new Promise(e=>e({success:false,value:{} as Trip}));
        }
    }
    public async DeleteManyDriverID(driverid:number):Promise<boolean>{
        await this.db.exec(`DELETE FROM trips WHERE driverid=${driverid};`);
        let res:Result<Trip[]>=await this.FindManyDriverID(driverid);
        if(res.success){
            return new Promise(e=>e(false));
        }else{
            return new Promise(e=>e(true));
        }
    }
    public async DeleteManyCompanyID(companyid:number){
        await this.db.exec(`DELETE FROM trips WHERE driverid=${companyid};`);
        let res:Result<Trip[]>=await this.FindManyDriverID(companyid);
        if(res.success){
            return new Promise(e=>e(false));
        }else{
            return new Promise(e=>e(true));
        }
    }

}