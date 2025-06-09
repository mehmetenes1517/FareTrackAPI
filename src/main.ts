import express from "express"
import cors from "cors"
import { LoginService } from "./Services/login.service";
import { WalletService } from "./Services/wallet.service";
import { UserRouter } from "./Routers/user.router";
import session from "express-session";
const app=express();



const user_router=new UserRouter(
                                    new LoginService(),
                                    new WalletService()
                                );

app.use(express.json());
app.use(cors({
    credentials:true
}));
app.use(session({
    secret:process.env.secret_key as string,
    resave:false,
    saveUninitialized:false,
    cookie:{
        maxAge:60000 * 60 // 1 hour i guess (?) 
    }
}))



app.use("/UserAPI",user_router.GetRouter());

app.listen(process.env.PORT,()=>console.log(`Server is listening port ${process.env.PORT}`))
