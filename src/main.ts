import express from "express"
import cors from "cors"
import { LoginService } from "./Services/login.service";
import { WalletService } from "./Services/wallet.service";
import { UserRouter } from "./Routers/user.router";
const app=express();



const user_router=new UserRouter(
                                    new LoginService(),
                                    new WalletService()
                                );

app.use(express.json());
app.use(cors({
    credentials:true
}));


app.use("/UserAPI",user_router.GetRouter());

app.listen(process.env.PORT,()=>console.log(`Server is listening port ${process.env.PORT}`))
