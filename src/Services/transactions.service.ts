import { Database,open } from "sqlite";
import sqlite3 from "sqlite3"
import { Result } from "../Models/result.model";
import { Transaction } from "../Models/transaction.model";
export class TransactionService{
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
    public async FindManyWalletID(walletid:number):Promise<Result<Transaction[]>>{
        let transactions:Transaction[]=await this.db.all(`SELECT * FROM transactions WHERE walletid=${walletid};`);
        return new Promise(e=>e({success:true,value:transactions}));
    }
    public async AddOne(walletid:number,type:string,amount:number):Promise<Result<Transaction>>{
        let obj:Transaction={walletid:walletid,type:type,amount:amount};
        await this.db.exec(`INSERT INTO transactions (walletid,type,amount) VALUES(${walletid},'${type}',${amount});`);
        return new Promise(e=>e({success:true,value:obj}));
    }
    public async DeleteAll(walletid:number):Promise<Result<Transaction[]>>{
        let a:Transaction[]= await this.db.all(`DELETE FROM transactions WHERE walletid=${walletid}`);
        return new Promise(e=>e({success:true,value:a}))
    }
}