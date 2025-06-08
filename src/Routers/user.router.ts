import express , { Request, Response, Router } from "express";
import { LoginService } from "../Services/login.service";
import { WalletService } from "../Services/wallet.service";
import { Result } from "../Models/result.model";
import { User } from "../Models/user.model";
import { Wallet } from "../Models/wallet.model";

export class UserRouter{
    private loginservice:LoginService;
    private walletservice:WalletService;
    private router:Router;
    constructor(loginservice:LoginService,walletservice:WalletService){
        this.loginservice=loginservice;
        this.walletservice=walletservice;
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
                res.status(200).json(create_result.value);
            }else{
                res.status(500).json("User Cannot Be Created");
            }
        });
        

        this.router.delete("/deleteuser",async (req:Request,res:Response)=>{
            let {id}=req.body;
            
            let user:Result<User>=await this.loginservice.DeleteOne(id);
            let wallet:Result<Wallet>=await this.walletservice.DeleteOne(id);
            
            if(user.success && wallet.success){
                res.status(200).json(
                    {
                        user:user.value,
                        wallet:wallet.value
                    });
            }
            else{
                res.status(404).json("There is no user or wallet with this info");
            }
        });

        this.router.put("/updateuser",async(req:Request,res:Response)=>{
            let {id,username,password,email,phone}=req.body;

            let update_result:Result<User>=await this.loginservice.UpdateOne(id,username,password,email,phone);
            
            if(update_result.success){
                res.status(200).json(update_result.value);
            }else{
                res.status(500).send("User cannot be found");
            }
        });

        this.router.put("/addmoney", async (req:Request,res:Response)=>{
            let {id,amount} = req.body;
            let updated_wallet:Result<Wallet>=await this.walletservice.FindOneForeignID(id);
            if(JSON.stringify(updated_wallet.value)!="{}"){
                updated_wallet.value.amount+=amount;
                let wallet:Result<Wallet>=await this.walletservice.UpdateOne(id,updated_wallet.value.amount);
                if(wallet.success){
                    res.status(200).json(wallet.value);
                }else{
                    res.status(404).json({});
                }
            }
            res.status(404).json("There is no Wallet with this info");
        })
        this.router.put("/withdrawmoney", async (req:Request,res:Response)=>{
            let {id,amount} = req.body;
            let wallet_:Result<Wallet> = await this.walletservice.FindOneForeignID(id);

            if(!wallet_.success){
                res.status(404).send("There is no wallet with this info");
                return;
            }else{

                if(wallet_.value.amount < amount){
                    res.status(500).send("Money is Not Enough for this operation");
                    return;
                }
                
                wallet_.value.amount-=amount;
                
                let wallet:Result<Wallet>=await this.walletservice.UpdateOne(id,wallet_.value.amount);
                if(wallet.success){
                    res.status(200).send(wallet.value);
                    return;
                }
            }
        })



        //Getting User And
        this.router.get("/getuser",async (req:Request,res:Response)=>{
            let {id}=req.body;
            
            let user_:Result<User> = await this.loginservice.FindOneID(id);
            if(!user_.success){
                res.status(500).json("This user doesnt exist");
            }
            else{
                res.status(200).json(user_.value);
            }
        });

        this.router.get("/getwallet",async (req:Request,res:Response)=>{
            let {id}=req.body;
            
            let wallet_:Result<Wallet>= await this.walletservice.FindOneForeignID(id);
            if(JSON.stringify(wallet_.value)=="{}"){
                res.status(500).json("This user doesnt exist");
            }
            else{
                res.status(200).json(wallet_.value);
            }
        });

    }
}