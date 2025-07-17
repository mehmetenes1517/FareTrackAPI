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
    async FindOneForeignID(foreign_id:number,roleid:number):Promise<Result<Wallet>>{
        let wallet:Wallet=(await this.db.get(`SELECT * FROM wallets WHERE foreign_id=${foreign_id} AND roleid=${roleid}`)) as Wallet; 

        if(typeof wallet == "undefined"){
            return new Promise(e=>e({success:false,value:{} as Wallet} as Result<Wallet>));
        }else{
            return new Promise(e=>e({success:true,value:wallet} as Result<Wallet>));
        }
    }
    async AddOne(foreign_id:number,roleid:number,amount:number):Promise<Result<Wallet>>{
        await this.db.exec(`INSERT INTO wallets (foreign_id,roleid,amount) VALUES (${foreign_id},${roleid},${amount});`);
        let wallet:Result<Wallet>=await this.FindOneForeignID(foreign_id,roleid);
        if(wallet.success){
            return new Promise(e=>e({success:true,value:wallet.value} as Result<Wallet>));
        }else{
            return new Promise(e=>e({success:false,value:{} as Wallet} as Result<Wallet>));
        }
    }
    async DeleteOne(foreign_id:number,roleid:number):Promise<Result<Wallet>>{
        let wallet:Result<Wallet>=await this.FindOneForeignID(foreign_id,roleid);
        if(JSON.stringify(wallet.value)!="{}"){
            await this.db.exec(`DELETE FROM wallets WHERE foreign_id=${foreign_id} AND roleid=${roleid}`);
            return new Promise(e=>e({success:true,value:wallet.value} as Result<Wallet>));
        }
        else{
            return new Promise(e=>e({success:false,value:{} as Wallet} as Result<Wallet>));
        }
    }
    async UpdateOne(foreign_id:number,roleid:number,amount:number):Promise<Result<Wallet>>{
        let wallet:Result<Wallet>=await this.FindOneForeignID(foreign_id,roleid);
        if(JSON.stringify(wallet.value)!="{}"){
            await this.db.exec(`UPDATE wallets SET amount=${amount} WHERE foreign_id=${foreign_id} AND roleid=${roleid};`);
            let wallet_updated:Result<Wallet>=await this.FindOneForeignID(foreign_id,roleid);
            return new Promise(e=>e({success:true,value:wallet_updated.value} as Result<Wallet>));
        }else{
            return new Promise(e=>e({success:false,value:{} as Wallet} as Result<Wallet>));
        }
    }
    async AddMoney(foreign_id:number,roleid:number,amount:number):Promise<Result<Wallet>>{
        let wallet=await this.FindOneForeignID(foreign_id,roleid);
        if(wallet.success){
            let amount_ : number=wallet.value.amount;
            amount_ += Number(amount);
            let updated:Result<Wallet>=await this.UpdateOne(foreign_id,roleid,amount_);
            if(updated.success){
                return new Promise(e=>e({success:true,value:updated.value}));
            }else{
                return new Promise(e=>e({success:false,value:{} as Wallet}));
            }
        }else{
            return new Promise(e=>e({success:false,value:{} as Wallet}));
        }
    }
    async WithdrawMoney(foreign_id:number,roleid:number,amount:number):Promise<Result<Wallet>>{
        let wallet=await this.FindOneForeignID(foreign_id,roleid);
        if(wallet.success){
            let amount_: number=wallet.value.amount;
            if(amount<=amount_){
                amount_-=amount;
                let updated:Result<Wallet>=await this.UpdateOne(foreign_id,roleid,amount_);
                if(updated.success){
                    return new Promise(e=>e({success:true,value:updated.value}));
                }else{
                    return new Promise(e=>e({success:false,value:{} as Wallet}));
                }
            }else{
                return new Promise(e=>e({success:false,value:{} as Wallet}));
            }
        }else{
            return new Promise(e=>e({success:false,value:{} as Wallet}));
        }
    }
}