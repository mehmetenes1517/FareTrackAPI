import express , { Request, Response, Router } from "express";
import { UserLoginService } from "../Services/user.login.service";
import { WalletService } from "../Services/wallet.service";
import { Result } from "../Models/result.model";
import { User } from "../Models/user.model";
import { Wallet } from "../Models/wallet.model";
import { createHash } from "crypto";
import { TransactionService } from "../Services/transactions.service";
import { Transaction } from "../Models/transaction.model";
import { GPSService } from "../Services/gps.service";
import { Location } from "../Models/location.model";

export class UserRouter{
    private loginservice:UserLoginService;
    private walletservice:WalletService;
    private transactionservice:TransactionService;
    private gpsservice:GPSService;
    private router:Router;
    constructor(loginservice:UserLoginService,walletservice:WalletService,transactionservice:TransactionService,gpsservice:GPSService){
        this.loginservice=loginservice;
        this.walletservice=walletservice;
        this.transactionservice=transactionservice;
        this.gpsservice=gpsservice;
        this.router=express.Router();
        this.SetupRoutes();
    }
    public GetRouter(){
        return this.router;
    }
    private SetupRoutes(){
        this.router.post("/createuser",async (req:Request,res:Response)=>{
            let {username,password,email,phone}=req.body;
            let create_result:Result<User>=await this.loginservice.AddOne(username,password,email,phone);
            if(create_result.success){
                let {id}=(await this.loginservice.FindOneUsername(username)).value;
                this.walletservice.AddOne(id,0);

                (req.session as any).userid=id;
                (req.session as any).username=username;
                (req.session as any).roleid=2;


                res.status(200).json("User Has Been Created");
            }else{
                res.status(401).json("User Cannot Be Created");
            }
        });
        this.router.delete("/deleteuser",async (req:Request,res:Response)=>{
            let {userid}=(req.session as any);
            if(userid){
                let user:Result<User>=await this.loginservice.DeleteOne(userid);
                let wallet:Result<Wallet>=await this.walletservice.DeleteOne(userid);
                if(user.success && wallet.success){
                    //Deleting all transaction history
                    let transactions:Result<Transaction[]>=await this.transactionservice.DeleteAll(wallet.value.id);
                    res.status(200).json(
                        {
                            user:user.value,
                            wallet:wallet.value
                        });
                }
                else{
                    res.status(404).json("There is no user or wallet with this info");
                }
            }else{
                res.status(401).json("Authorization Required");
            }
        });
        this.router.put("/updateuser",async(req:Request,res:Response)=>{

            if((req.session as any).userid && (req.session as any).username && (req.session as any).roleid && (req.session as any).roleid==2){
                let {username,password,email,phone}=req.body;
                let update_result:Result<User>=await this.loginservice.UpdateOne((req.session as any).userid,username,password,email,phone);
                
                if(update_result.success){
                    (req.session as any).username=username;
                    res.status(200).json(update_result.value);
                }else{
                    res.status(500).send("User cannot be found");
                }
            }else{
                res.status(401).json("Authorization Required");
            }
        });
        this.router.put("/addmoney", async (req:Request,res:Response)=>{
            let {userid,username,roleid}=(req.session as any);
            if(userid && username && roleid && roleid==2){
                
                let {amount} = req.body;
                
                let updated_wallet:Result<Wallet>=await this.walletservice.FindOneForeignID(userid);
                if(typeof updated_wallet.value != "undefined"){
                    
                    updated_wallet.value.amount+=amount;
                    
                    //Adding to Transaction history
                    await this.transactionservice.AddOne(updated_wallet.value.id,'income',amount);

                    let wallet:Result<Wallet>=await this.walletservice.UpdateOne(userid,updated_wallet.value.amount);
                    
                    if(wallet.success){
                        res.status(200).json("Money is added");
                    }else{
                        res.status(401).json("This Operation cannot be done");
                    }
                }else{
                    res.status(401).json("There is no Wallet with this info");
                }
            }else{
                res.status(401).json("Authorization Required");
            }
        });
        this.router.put("/withdrawmoney", async (req:Request,res:Response)=>{
            let {userid,username,roleid}=(req.session as any);

            if(userid && username && roleid && roleid==2){
                let {amount} = req.body;
                let wallet_:Result<Wallet> = await this.walletservice.FindOneForeignID(userid);
    
                if(!wallet_.success){
                    res.status(401).send("There is no wallet with this info");
                    return;
                }else{
    
                    if(wallet_.value.amount < amount){
                        res.status(401).send("Money is Not Enough for this operation");
                        return;
                    }
                    

                    wallet_.value.amount-=amount;

                    //Adding to Transaction history
                    await this.transactionservice.AddOne(wallet_.value.id,'outcome',amount);
    
                    let wallet:Result<Wallet>=await this.walletservice.UpdateOne(userid, wallet_.value.amount);

                    if(wallet.success){
                        res.status(200).send("Money has been withdrawed");
                        return;
                    }
                }
            }else{
                res.status(401).json("Authorization Required");
            }
        });
        this.router.get("/getuser",async (req:Request,res:Response)=>{
            let {userid,username,roleid}=(req.session as any);
            if(userid && username && roleid && roleid==2){   
                let user_:Result<User> = await this.loginservice.FindOneID(userid);
                if(user_.success){
                    res.status(200).json(user_.value);
                }
                else{
                    res.status(500).json("This user doesnt exist");
                }
            }else{
                res.status(401).json("Authorization Required")
            }
        });
        this.router.get("/gettransactions",async (req:Request,res:Response)=>{
            let {userid,username,roleid}=req.session as any;
            if(userid && username && roleid && roleid==2){
                let wallet_:Result<Wallet>=await this.walletservice.FindOneForeignID(userid);
                if(wallet_.success){   
                    let transactions:Result<Transaction[]>=await this.transactionservice.FindManyWalletID(wallet_.value.id);
                    res.status(200).send(transactions.value);
                    return;
                }
                res.status(401).send("Error Occured");
                return;
            }else{
                res.status(401).send("Authorization Required");
                return;
            }
        });
        this.router.get("/getwallet",async (req:Request,res:Response)=>{
            let {userid,username,roleid}=(req.session as any);
            if(userid && username && roleid && roleid==2){   
                
                let wallet_:Result<Wallet>= await this.walletservice.FindOneForeignID(userid);
                if(wallet_.success){
                    res.status(200).json(wallet_.value);
                }
                else{
                    res.status(401).json("This user doesnt exist");
                }
            }else{
                res.status(401).json("Authoriztion Required");
            }
        });
        this.router.post("/loginuser",async (req:Request,res:Response)=>{
            let{username,password}=req.body;
            let result = await this.loginservice.FindOneUsername(username);
            
            if(result.success){
                password=createHash("sha512").update(password).digest("hex");
                if(result.value.password==password){
                    (req.session as any).userid=result.value.id;
                    (req.session as any).username=username;
                    (req.session as any).roleid=2;

                    res.status(200).send("Login Successful");
                }
                else{
                    res.status(401).send("Wrong Username Or Password");
                }
                    
            }else{
                res.status(401).send("There is No User");
            }

            
        });
        this.router.get("/getlocation",async (req:Request,res:Response)=>{
                    let {username,userid,roleid} = req.session as any;
                    if(username && userid && roleid && roleid==2){
                        let location :Result<Location> =await this.gpsservice.FindOneUserID(userid);
                        if(location.success){
                            res.status(200).send(location.value);
                        }else{
                            res.status(401).send("Cannot Get Location");
                        }
                    }else{
                        res.status(401).send("Authorization Required");
                    }
        
        });
         this.router.post("/sharelocation",async (req:Request,res:Response)=>{
                    let {userid,username,roleid}=req.session as any;
                    if(userid && username && roleid==2){
                        let {longtitude,latitude,time} = req.body;
                        let user:Result<User>=await this.loginservice.FindOneID(userid);
                        if(user.success){
                            let location :Result<Location>= await this.gpsservice.FindOneUserID(userid);
                            if(location.success){
                                let loc_update:Result<Location>=await this.gpsservice.UpdateOneUser(userid,longtitude,latitude,time);
                                res.status(200).send(loc_update.value);
                            }else{
                                let loc_add:Result<Location>=await this.gpsservice.AddOneUser(userid,longtitude,latitude,time);
                                res.status(200).send(loc_add.value);
                            }
                        }else{
                            res.status(401).send("User Cannot be Found");
                        }
                    }else{
                        res.status(401).send("Authorization Required");
                    }
        
                });
        
    }
}