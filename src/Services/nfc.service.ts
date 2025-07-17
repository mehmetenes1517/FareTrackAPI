import { Database, open } from "sqlite";
import sqlite3 from "sqlite3";
import { CompanyLoginService } from "./company.login.service";
import { DriverLoginService } from "./driver.login.service";
import { UserLoginService } from "./user.login.service";
import { TripsService } from "./trips.service";
import { TransactionService } from "./transactions.service";
import { WalletService } from "./wallet.service";
import { Driver } from "../Models/driver.model";
import { Result } from "../Models/result.model";
import { User } from "../Models/user.model";
import { Wallet } from "../Models/wallet.model";
export class NFCService{
    private db:Database;
    private companyservice:CompanyLoginService;
    private driverservice:DriverLoginService;
    private userservice:UserLoginService;
    private tripservice:TripsService;
    private transactionservice:TransactionService;
    private walletservice:WalletService;

    constructor(companyservice:CompanyLoginService,driverservice:DriverLoginService,userservice:UserLoginService,tripservice:TripsService,transactionservice:TransactionService,walletservice:WalletService){
        this.SetupDB();
        this.companyservice=companyservice;
        this.driverservice=driverservice;
        this.userservice=userservice;
        this.tripservice=tripservice;
        this.transactionservice=transactionservice;
        this.walletservice=walletservice;
    }
    private async SetupDB(){
        this.db= await open({
            filename:"main.db",
            driver:sqlite3.Database
        });
    }
    public async MakePayment(driverid:number,userid:number,from_:string,to_:string,time:string,price:number):Promise<Result<string>>{
        let driver:Result<Driver>=await this.driverservice.FindOneID(driverid);
        if(driver.success){
            let user:Result<User>=await this.userservice.FindOneID(userid);
            if(user.success){
                
                // Delete Money from user and Add to Company
                let user_wallet:Result<Wallet> =await this.walletservice.WithdrawMoney(userid,2,price);
                if(user_wallet.success){
                    // create transaction for user
                    await this.transactionservice.AddOne(user_wallet.value.id,"outcome",price);
                    let company_wallet:Result<Wallet>= await this.walletservice.AddMoney(driver.value.companyid,0,price as number);
                    if(company_wallet.success){
                        // create trip for company and driver
                        await this.tripservice.InsertOne(driver.value.id,from_,to_,price,time);
                        return new Promise(e=>e({success:true,value:"OK"}));
                    }else{
                        return new Promise(e=>e({success:false,value:"ERROR"}));
                    }
                }else{
                    return new Promise(e=>e({success:false,value:"ERROR"}));
                }

            }else{
                return new Promise(e=>e({success:false,value:"ERROR"}));
            }
        }else{
            return new Promise(e=>e({success:false,value:"ERROR"}));
        }
    }







};