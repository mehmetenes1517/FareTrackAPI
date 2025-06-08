import { Database,open } from "sqlite";
import sqlite3 from "sqlite3"
import { Wallet } from "../Models/wallet.model";
import { User } from "../Models/user.model";
import { Result } from "../Models/result.model";

export class WalletService{

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
    

    async FindOneID(id:number):Promise<Result<Wallet>> {
        let wallet:Wallet =(await this.db.get(`SELECT * FROM wallets WHERE id=${id}`) ) as Wallet;
        if(typeof wallet == "undefined"){
            return new Promise(e=>e({ success:false,value:{} as Wallet } as Result<Wallet>));
        }else{
            return new Promise(e=>e({ success:true, value:wallet } as Result<Wallet>))
        }
    }
    async FindOneForeignID(foreign_id:number):Promise<Result<Wallet>>{
        let wallet:Wallet=(await this.db.get(`SELECT * FROM wallets WHERE foreign_id=${foreign_id}`)) as Wallet;
        if(typeof wallet == "undefined"){
            return new Promise(e=>e({success:false,value:{} as Wallet} as Result<Wallet>));
        }else{
            return new Promise(e=>e({success:true,value:wallet} as Result<Wallet>));
        }
    }
    async FindManyForeignID(foreign_id:number):Promise<Result<Wallet[]>>{
        let wallet:Wallet[]=(await this.db.all(`SELECT * FROM wallets WHERE foreign_id=${foreign_id}`)) as Wallet[];
        if(typeof wallet =="undefined"){
            return new Promise(e=>e({success:false,value:[] as Wallet[]}as Result<Wallet[]>));
        }else{
            return new Promise(e=>e({success:true,value:wallet} as Result<Wallet[]>));
        }
    }
    async AddOne(foreign_id:number,amount:number):Promise<Result<Wallet>>{
        await this.db.exec(`INSERT INTO wallets (foreign_id,amount) VALUES (${foreign_id},${amount});`);
        let wallet:Result<Wallet>=await this.FindOneForeignID(foreign_id);
        if(JSON.stringify(wallet.value)!="{}" ){
            return new Promise(e=>e({success:true,value:wallet.value} as Result<Wallet>));
        }else{
            return new Promise(e=>e({success:false,value:{} as Wallet} as Result<Wallet>));
        }
    }
    async DeleteOne(foreign_id:number):Promise<Result<Wallet>>{
        let wallet:Result<Wallet>=await this.FindOneForeignID(foreign_id);
        if(JSON.stringify(wallet.value)!="{}"){
            await this.db.exec(`DELETE FROM wallets WHERE foreign_id=${foreign_id}`);
            return new Promise(e=>e({success:true,value:wallet.value} as Result<Wallet>));
        }
        else{
            return new Promise(e=>e({success:false,value:{} as Wallet} as Result<Wallet>));
        }
    }
    async UpdateOne(foreign_id:number,amount:number):Promise<Result<Wallet>>{
        let wallet:Result<Wallet>=await this.FindOneForeignID(foreign_id);
        if(JSON.stringify(wallet.value)!="{}"){
            await this.db.exec(`UPDATE wallets SET amount=${amount} WHERE foreign_id=${foreign_id};`);
            let wallet_updated:Result<Wallet>=await this.FindOneForeignID(foreign_id);
            return new Promise(e=>e({success:true,value:wallet_updated.value} as Result<Wallet>));
        }else{
            return new Promise(e=>e({success:false,value:{} as Wallet} as Result<Wallet>));
        }

    }

}