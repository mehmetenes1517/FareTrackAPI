import { Database , open} from "sqlite";
import sqlite3 from "sqlite3"
import { Result } from "../Models/result.model";
import { Location } from "../Models/location.model";
export class GPSService{
    private db:Database;

    constructor(){
        this.SetupDB();
    }

    private async SetupDB(){
        this.db= await open({
            filename:"main.db",
            driver:sqlite3.Database
        });
    }

    // ROLE DISTRUBUTION
    //ADMIN  0 
    //DRIVER 1
    //PASSENGER 2

    public async FindOneDriverID(id:number):Promise<Result<Location>>{
        let location_ = await this.db.get(`SELECT * FROM locations WHERE foreignid=${id} AND roleid=1;`);
        if(typeof location_=="undefined"){
            return new Promise(e=>e({success:false,value:{} as Location}));
        }else{
            return new Promise(e=>e({success:true,value:location_}));
        }
    }
    public async AddOneDriver(id:number,longtitude:number,latitude:number,time:string):Promise<Result<Location>>{
        let driver:Result<Location>= await this.FindOneDriverID(id);
        if(driver.success){
            return new Promise(e=>e({success:false,value:{} as Location}));
        }else{
            await this.db.exec(`INSERT INTO locations (foreignid,roleid,longtitude,latitude,time) VALUES(${id},1,${longtitude},${latitude},'${time}')`);
            let driver_:Result<Location>= await this.FindOneDriverID(id);
            if(driver_.success){
                return new Promise(e=>e({success:true,value: driver_.value}));
            }else{
                return new Promise(e=>e({success:false,value: {} as Location}));
            }
        }
    }
    public async UpdateOneDriver(id:number,longtitude:number,latitude:number,time:string): Promise<Result<Location>>{
        let driver_:Result<Location>= await this.FindOneDriverID(id);
        if(driver_.success){
            await this.db.exec(`UPDATE locations SET longtitude=${longtitude},latitude=${latitude},time='${time}' WHERE foreignid=${id} AND roleid=1`);
            return new Promise(e=>e({success:true,value:{foreignid:id,roleid:1,longtitude:longtitude,latitude:latitude,time:time}}));
        }else{  
            return new Promise(e=>e({success:false,value:{} as Location}));
        }
    }
    public async DeleteOneDriver(id:number):Promise<Result<Location>>{
        let driver_:Result<Location>=await this.FindOneDriverID(id);
        if(driver_.success){
            await this.db.exec(`DELETE FROM location WHERE roleid=1 AND foreignid=${id};`);
            return driver_;
        }else{
            return new Promise(e=>e({success:false,value:{} as Location}));
        }
    }
    public async FindOneUserID(id:number):Promise<Result<Location>> {
        let location_ = await this.db.get(`SELECT * FROM locations WHERE foreignid=${id} AND roleid=2;`);
        if(typeof location_=="undefined"){
            return new Promise(e=>e({success:false,value:{} as Location}));
        }else{
            return new Promise(e=>e({success:true,value:location_}));
        }
    }
    public async AddOneUser(id:number,longtitude:number,latitude:number,time:string):Promise<Result<Location>>{
        let user:Result<Location>= await this.FindOneUserID(id);
        if(user.success){
            return new Promise(e=>e({success:false,value:{} as Location}));
        }else{
            await this.db.exec(`INSERT INTO locations (foreignid,roleid,longtitude,latitude,time) VALUES(${id},2,${longtitude},${latitude},'${time}')`);
            let user_:Result<Location>= await this.FindOneUserID(id);
            if(user_.success){
                return new Promise(e=>e({success:true,value: user_.value}));
            }else{
                return new Promise(e=>e({success:false,value: {} as Location}));
            }
        }
    }
    public async UpdateOneUser(id:number,longtitude:number,latitude:number,time:string): Promise<Result<Location>>{
        let user_:Result<Location>= await this.FindOneDriverID(id);
        if(user_.success){
            await this.db.exec(`UPDATE locations SET longtitude=${longtitude},latitude=${latitude},time='${time}' WHERE foreignid=${id} AND roleid=2`);
            return new Promise(e=>e({success:true,value:{foreignid:id,roleid:1,longtitude:longtitude,latitude:latitude,time:time}}));
        }else{  
            return new Promise(e=>e({success:false,value:{} as Location}));
        }
    }
    public async DeleteOneUser(id:number):Promise<Result<Location>>{
        let user_:Result<Location>=await this.FindOneDriverID(id);
        if(user_.success){
            await this.db.exec(`DELETE FROM location WHERE roleid=2 AND foreignid=${id};`);
            return user_;
        }else{
            return new Promise(e=>e({success:false,value:{} as Location}));
        }
    }
}