import {open,Database} from "sqlite"
import sqlite3 from "sqlite3";
import { createHash } from "crypto";
import { User } from "../Models/user.model";
import { Result } from "../Models/result.model";

export class LoginService{
    private db:Database;
    constructor(){
        this.SetDB();
    }
    private async SetDB(){
        this.db=await open({
            filename:"main.db",
            driver:sqlite3.Database
        });
    }
    async FindOneUsername(username:string):Promise<Result<User>>{
            let user: User =(await this.db.get(`SELECT * FROM users WHERE username='${username}';`)) as User;
            if(typeof user == "undefined"){
                return new Promise(e=>e({success:false,value:{} as User}));
            }else{
                return new Promise(e=>e({success:true,value:user}));
            }
    }
    async FindManyUsername(username:string):Promise<Result<User[]>>{
            let user:User[] =(await this.db.all(`SELECT * FROM users WHERE username='${username}';`)) as User[] ;
            if(user.length==0){
                return new Promise(e=>e({success:false,value:[] as User[]}));
            }else{
                return new Promise(e=>e({success:true,value:user}));
            }
    }
    async FindOneEmail(email:string):Promise<Result<User>>{
            let user:User =(await this.db.get(`SELECT * FROM users WHERE email='${email}';`)) as User ;
            if(typeof user == "undefined"){
                return new Promise(e=>e({success:false,value:{} as User}));
            }else{
                return new Promise(e=>e({success:true,value:user}));
            }
    }
    async FindManyEmail(email:string):Promise<Result<User[]>>{
            let user:User[] =(await this.db.all(`SELECT * FROM users WHERE email='${email}';`)) as User[] ;
            if(user.length==0){
                return new Promise(e=>e({success:false,value:[] as User[]}));
            }else{
                return new Promise(e=>e({success:true,value:user}));
            }
    }
    async FindOnePhone(phone:string):Promise<Result<User>>{
            let user:User =(await this.db.get(`SELECT * FROM users WHERE phone='${phone}';`)) as User ;
            if(typeof user == "undefined"){
                return new Promise(e=>e({success:false,value:{} as User}));
            }else{
                return new Promise(e=>e({success:true,value:user}));
            }
    }
    async FindManyPhone(phone:string):Promise<Result<User[]>>{
            let user:User[] =(await this.db.all(`SELECT * FROM users WHERE phone='${phone}';`)) as User[] ;
            if(user.length==0){
                return new Promise(e=>e({success:false,value:[] as User[]}));
            }else{
                return new Promise(e=>e({success:true,value:user}));
            }
    }
    async FindOneID(id:number):Promise<Result<User>>{
            let user: User =(await this.db.get(`SELECT * FROM users WHERE id=${id}`)) as User;
            if(typeof user == "undefined"){
                return new Promise(e=>e({success:false,value:{} as User}));
            }else{
                return new Promise(e=>e({success:true,value:user}));
            }
        
    }
    async FindManyID(id:number):Promise<Result<User[]>>{
            let user:User[] =(await this.db.all(`SELECT * FROM users WHERE id=${id}`)) as User[] ;
            if(user.length==0){
                return new Promise(e=>e({success:false,value:[] as User[]}));
            }else{
                return new Promise(e=>e({success:true,value:user}));
            }
    }

    async DeleteOne(id:number):Promise<Result<User>>{
        let user:Result<User>= await this.FindOneID(id);
        if(!user.success){
            return new Promise(e=>e({success:false,value:{} as User}));
        }else{
            await this.db.exec(`DELETE FROM users WHERE id=${id}`);
            return new Promise(e=>e({success:true,value:user.value}));
        }
    }


    //Update Users 
    //If we want to change the informations to already exist informations in another user, this is not allowed
    async UpdateOne(id:number,username:string,password:string,email:string,phone:string):Promise<Result<User>>{
        
        //Checking existance of user
        let user:Result<User>= await this.FindOneID(id);
        
        if( !user.success ){
            return new Promise(e=>e({success:false,value:{} as User}));
        }else{
            let hashed_password=createHash("sha512").update(password).digest("hex");
            await this.db.exec(`UPDATE users SET username='${username}',password='${hashed_password}',email='${email}',phone='${phone}' WHERE id=${id}`);
            return new Promise(e=>e({success:true, value: {id:id,username:username,password:hashed_password,email:email,phone:phone} as User }));
        }


    }

    async AddOne(username:string,password:string,email:string,phone:string):Promise<Result<User>>{
        let hashed_password=createHash("sha512").update(password).digest("hex");

        let users:Result<User[]>=await this.FindManyUsername(username);
        let phones:Result<User[]>=await this.FindManyPhone(phone);
        let emails:Result<User[]>=await this.FindManyEmail(email);
        

        if(!users.success && !phones.success && !emails.success){
            await this.db.exec(`INSERT INTO users(username,password,email,phone) VALUES('${username}','${hashed_password}','${email}','${phone}');`);
            let user:Result<User>=await this.FindOneUsername(username);
            if(user.success){
                return new Promise(e=>e({success:true,value:user.value})); 
            }else{
                return new Promise(e=>e({success:false,value:{} as User})); 
            }
        }else{
            return new Promise(e=>e({success:false,value:{} as User}));
        }
    }

};