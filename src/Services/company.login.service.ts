import { Database, open } from "sqlite";
import sqlite3 from "sqlite3";
import { Result } from "../Models/result.model";
import { Company } from "../Models/company.model";
import { createHash } from "crypto";
export class CompanyLoginService{
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
    async FindOneID(id:number):Promise<Result<Company>>{
        let company=await this.db.get(`SELECT * FROM companies WHERE id=${id}`);
        if(typeof company == "undefined"){
            return new Promise(e=>e({success:false,value:{} as Company}));
        }else{
            return new Promise(e=>e({success:true,value:company }));
        }
    }
    async FindOneCompanyname(companyname:string):Promise<Result<Company>>{
        let company=await this.db.get(`SELECT * FROM companies WHERE companyname='${companyname}'`);
        if(typeof company == "undefined"){
            return new Promise(e=>e({success:false,value:{} as Company}));
        }else{
            return new Promise(e=>e({success:true,value:company }));
        }
    }
    async FindOneUsername(username:string):Promise<Result<Company>>{
        let company=await this.db.get(`SELECT * FROM companies WHERE username='${username}';`);
        if(typeof company == "undefined"){
            return new Promise(e=>e({success:false,value:{} as Company}));
        }else{
            return new Promise(e=>e({success:true,value:company }));
        }
    }
    async FindOneEmail(email:string):Promise<Result<Company>>{
        let company=await this.db.get(`SELECT * FROM companies WHERE email='${email}'`);
        if(typeof company == "undefined"){
            return new Promise(e=>e({success:false,value:{} as Company}));
        }else{
            return new Promise(e=>e({success:true,value:company }));
        }
    }
    async FindOnePhone(phone:string):Promise<Result<Company>>{
        let company=await this.db.get(`SELECT * FROM companies WHERE phone='${phone}'`);
        if(typeof company == "undefined"){
            return new Promise(e=>e({success:false,value:{} as Company}));
        }else{
            return new Promise(e=>e({success:true,value:company }));
        }
    }
    async AddOne(companyname:string,username:string,password:string,email:string,phone:string):Promise<Result<Company>>{

        let company_:Result<Company>=await this.FindOneCompanyname(companyname);
        let username_:Result<Company>=await this.FindOneUsername(username);
        let email_:Result<Company>=await this.FindOneEmail(email);
        let phone_:Result<Company>=await this.FindOnePhone(phone);

        if(!company_.success && !username_.success && !email_.success && !phone_.success){
            password=createHash("sha512").update(password).digest("hex");
            await this.db.exec(`INSERT INTO companies (companyname,username,password,email,phone) VALUES('${companyname}','${username}','${password}','${email}','${phone}');`);
            let cmp:Result<Company>=await this.FindOneUsername(username);
            if(cmp.success){
                return new Promise(e=>e({success:true,value:cmp.value}));
            }else{
                return new Promise(e=>e({success:false,value:{} as Company}));
            }
        }else{
            return new Promise(e=>e({success:false,value:{}as Company}));
        }
    }
    async DeleteOne(id:number):Promise<Result<Company>>{   
        let company_:Result<Company>=await this.FindOneID(id)
        if(company_.success){
            await this.db.exec(`DELETE FROM companies WHERE id=${id}`);
            return new Promise(e=>e({success:true,value:company_.value}));
        }else{
            return new Promise(e=>e({success:false,value:{}as Company}));
        }
    }
    async UpdateOne(id:number,companyname:string,username:string,password:string,email:string,phone:string):Promise<Result<Company>>{



       //Think About it 
        let companyname_:Result<Company>=await this.FindOneCompanyname(companyname);
        let username_:Result<Company>=await this.FindOneUsername(username);
        let email_:Result<Company>=await this.FindOneEmail(email);
        let phone_:Result<Company>=await this.FindOnePhone(phone);
        if(companyname_.success && username_.success && email_.success && phone_.success){

            if(companyname_.value.id==id && phone_.value.id==id && email_.value.id==id && username_.value.id!=id){
                await this.db.exec(`UPDATE companies SET companyname='${companyname}',username='${username}', password='${password}', email='${email}' , phone='${phone}' WHERE id='${id}';`);
                let updated_:Result<Company> = await this.FindOneID(id);
                if(updated_.success){
                    return new Promise(e=>e({success:true,value:updated_.value}));
                    
                }else{
                    
                    return new Promise(e=>e({success:false,value:{} as Company}));
                }
            }
            else{
                return new Promise(e=>e({success:false,value:{}as Company}));
            }
        }else{
            await this.db.exec(`UPDATE companies SET companyname='${companyname}',username='${username}', password='${password}', email='${email}' , phone='${phone}' WHERE id='${id}';`);
            let updated_:Result<Company> = await this.FindOneID(id);
            if(updated_.success){
                return new Promise(e=>e({success:true,value:updated_.value}));
                
            }else{
                
                return new Promise(e=>e({success:false,value:{} as Company}));
            }
        }
    }

};