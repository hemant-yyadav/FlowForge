import express from "express";
import jwt from "jsonwebtoken";
import { SigninSchema, CreateRoomSchema,CreateUserSchema} from "@repo/common/src/types"
import { middleware } from "./middleware";
const app = express();

app.post('/signin',(req,res) =>{
    const data = SigninSchema.safeParse(req.body);
    if(!data.success){
        res.json({
            message : "wrong input schema"
        })
        return;
    }
    res.json({
        userId : "sadjfkl;as"
    })
});


app.post('/signup',(req,res) =>{
    // @ts-ignore
    const userId = req.userId;
    const token = jwt.sign(userId,"sdkjfla")
    res.json({
        token 
    })
}); 

app.post('/room',middleware,(req,res) =>{
    const data = CreateRoomSchema.safeParse(req.body);
    if(!data.success){
        res.json({
            message : "incorrect inputs"
        })
        return;
    }
    res.json({
        roomId : "sdjlfa"
    })
});

app.listen(3001);