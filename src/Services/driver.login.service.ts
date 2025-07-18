import { Database } from "sqlite";
import {open} from "sqlite"
import sqlite3 from "sqlite3";
import { Result } from "../Models/result.model";
import { Driver } from "../Models/driver.model";
import { createHash } from "crypto";
export class DriverLoginService{
    private db:Database;
    constructor(){
        this.SetupDB();
    }
    private async SetupDB(){
        this.db=await open({
            filename:"main.db",
            driver:sqlite3.Database
        });
    }

    async FindOneID(id:number): Promise<Result<Driver>>{
        let driver=await this.db.get(`SELECT * FROM drivers WHERE id=${id}`)
        if(typeof driver=="undefined"){
            return new Promise(e=>e({success:false,value:{} as Driver}));
        }else{
            return new Promise(e=>e({success:true,value:driver as Driver}));
        }
    }
    async FindManyID(id:number): Promise<Result<Driver[]>>{
        let drivers:Driver[]=await this.db.all(`SELECT * FROM drivers WHERE id=${id}`)
        return new Promise(e=>e({success:true,value:drivers}));
    }
    async FindOneCompanyID(id:number): Promise<Result<Driver>>{
        let driver=await this.db.get(`SELECT * FROM drivers WHERE companyid=${id}`)
        if(typeof driver=="undefined"){
            return new Promise(e=>e({success:false,value:{} as Driver}));
        }else{
            return new Promise(e=>e({success:true,value:driver as Driver}));
        }
    }
    async FindManyCompanyID(id:number): Promise<Result<Driver[]>>{
        let drivers:Driver[]=await this.db.all(`SELECT * FROM drivers WHERE companyid=${id}`)
        return new Promise(e=>e({success:true,value:drivers}));
    }
    async FindOneUsername(username:string): Promise<Result<Driver>>{
        let driver=await this.db.get(`SELECT * FROM drivers WHERE username='${username}'`)
        if(typeof driver=="undefined"){
            return new Promise(e=>e({success:false,value:{} as Driver}));
        }else{
            return new Promise(e=>e({success:true,value:driver as Driver}));
        }
    }
    async FindManyUsername(username:string): Promise<Result<Driver[]>>{
        let drivers:Driver[]=await this.db.all(`SELECT * FROM drivers WHERE username='${username}'`)
        return new Promise(e=>e({success:true,value:drivers}));
    }
    async FindOneEmail(email:string): Promise<Result<Driver>>{
        let driver=await this.db.get(`SELECT * FROM drivers WHERE email='${email}'`)
        if(typeof driver=="undefined"){
            return new Promise(e=>e({success:false,value:{} as Driver}));
        }else{
            return new Promise(e=>e({success:true,value:driver as Driver}));
        }
    }
    async FindManyEmail(email:string): Promise<Result<Driver[]>>{
        let drivers:Driver[]=await this.db.all(`SELECT * FROM drivers WHERE email='${email}'`)
        return new Promise(e=>e({success:true,value:drivers}));
    }
    async FindOneBusid(busid:string): Promise<Result<Driver>>{
        let driver=await this.db.get(`SELECT * FROM drivers WHERE busid='${busid}'`)
        if(typeof driver=="undefined"){
            return new Promise(e=>e({success:false,value:{} as Driver}));
        }else{
            return new Promise(e=>e({success:true,value:driver as Driver}));
        }
    }
    async FindManyBusid(busid:string): Promise<Result<Driver[]>>{
        let drivers:Driver[]=await this.db.all(`SELECT * FROM drivers WHERE busid='${busid}'`)
        return new Promise(e=>e({success:true,value:drivers}));
    }
    async AddOne(companyid:number,isactive:boolean,username:string,email:string,password:string,busid:string): Promise<Result<Driver>>{
        let username_:Result<Driver>=await this.FindOneUsername(username);
        let email_:Result<Driver>=await this.FindOneEmail(email);
        let busid_:Result<Driver>=await this.FindOneEmail(busid);
        if(!username_.success && typeof !email_.success && typeof !busid_.success){
            password=createHash("sha512").update(password).digest("hex");
            await this.db.exec(`INSERT INTO drivers(companyid,isactive,username,email,password,busid) VALUES(${companyid},${isactive},'${username}','${email}','${password}','${busid}');`);
            let driver_result:Result<Driver>=await this.FindOneUsername(username);
            if(driver_result.success){    
                return new Promise(e=>e({success:true,value:driver_result.value}));
            }else{
                return new Promise(e=>e({success:false,value:{} as Driver}));
            }
        }else{
            return new Promise(e=>e({success:false,value:{} as Driver}));
        }
    }
    async DeleteOne(id:number):Promise<Result<Driver>>{
        let user_result:Result<Driver>=await this.FindOneID(id);
        if(user_result.success){
            let user:Driver=user_result.value;
            await this.db.exec(`DELETE FROM drivers WHERE id=${id}`);
            return new Promise(e=>e({success:false,value:user}));

        }else{
            return new Promise(e=>e({success:false,value:{} as Driver}));
        }
    }
    async UpdateOne(id:number,companyid:number,isactive:boolean,username:string,email:string,password:string,busid:string):Promise<Result<Driver>>{
        let user_:Result<Driver>= await this.FindOneID(id);
        let username_:Result<Driver>=await this.FindOneUsername(username);
        let email_:Result<Driver>=await this.FindOneEmail(email);
        let busid_:Result<Driver>=await this.FindOneBusid(username);
        if(!user_.success){
            return new Promise(e=>e({success:false,value:{} as Driver}));
        }
        else if(username_.success && username_.value.id!=id || email_.success && email_.value.id!=id || busid_.success && busid_.value.id!=id){
            return new Promise(e=>e({success:false,value:{} as Driver}));
        }else{
            await this.db.exec(`UPDATE drivers 
                SET 
                companyid=${companyid},
                isactive=${isactive},
                username='${username}',
                password='${password}',
                email='${email}',
                busid='${busid}' 
                WHERE id=${id}`);
            let updated_driver:Result<Driver>=await this.FindOneID(id);
            if(updated_driver.success){
                return new Promise(e=>e({success:true,value:updated_driver.value}));
            }else{
                return new Promise(e=>e({success:false,value:{} as Driver}));
            }
        }

    }
    async ActivateOne(id:number):Promise<Result<boolean>>{
        let driver:Result<Driver>=await this.FindOneID(id);
        if(driver.success){
            await this.db.exec(`UPDATE drivers SET isactive=1 WHERE id=${id}`);
            return new Promise(e=>e({success:true,value:true}));
        }else{
            return new Promise(e=>e({success:false,value:false}));
        }
    }
    async DeactivateOne(id:number):Promise<Result<boolean>>{
        let driver:Result<Driver>=await this.FindOneID(id);
        if(driver.success){
            await this.db.exec(`UPDATE drivers SET isactive=0 WHERE id=${id}`);
            return new Promise(e=>e({success:true,value:true}));
        }else{
            return new Promise(e=>e({success:false,value:false}));
        }
    }
}