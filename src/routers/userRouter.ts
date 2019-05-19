import * as express from 'express'
import { authorizationMiddleware } from '../middleware/authorization.middleware';
import { User } from '../models/user';
import { findAllUsersService, findUserByIdService, updateUserService } from '../services/user.service';
import { findRolByIdService } from '../services/role.service';
import { dtoUser } from '../dao/models/DTO';
import { asyncHandler } from '../util/asyncHandler';
import ReimbusementError from '../util/ReimbursementError';



export const userRouter = express.Router();

//Base path::   /users   from   index.ts



// Find Users
// URL /users 
// Method: GET
// Allowed Roles finance-manager
// Response:User

userRouter.get('/',[authorizationMiddleware(['admin','manager']),asyncHandler(async (req,res)=>{
    let users:User[] = await findAllUsersService();
    res.status(200)
    res.json(users);
    
})]);

// Find Users By Id
// URL /users/:id
// Method: GET
// Allowed Roles finance-manager or if the id provided matches the id of the current user
// Response:User
userRouter.get('/:userId',[authorizationMiddleware(['admin','manager','employee']),asyncHandler(async (req,res)=>{
    //TO DO : Allowed Roles finance-manager or if 
    //        the id provided matches the id of the current user
    let id = +req.params.userId;
    if (req.userRole === "employee" && req.userId != id) {
      throw new ReimbusementError(400,`User is not authorized to see other users`);
    }
    let user:User = await findUserByIdService(id)
    res.status(200);
    res.json(user);
   
})]);

// Update User
// URL /users
// Method: PATCH
// Allowed Roles admin
// Request The userId must be presen as well as all fields to 
//    update, any field left undefined will not be updated.:User
// Response:User

userRouter.patch('/:id',[authorizationMiddleware(['admin']),asyncHandler(async (req,res)=>{
    const userdto:dtoUser = {
        user_id :  req.body.id, // primary key
        username : req.body.userName  ,// not null, unique
        firstname : req.body.firstName  , // not null
        lastname : req.body.lastName  , // not null
        email : req.body.email   ,// not null
        role_id : req.body.role   // not null
    };
    for (let key in userdto){
        if(!userdto[key]){
            throw new ReimbusementError(400,"Please insert all fields in the correct way");
        }
    }
    const user:User = await updateUserService(userdto);
    res.status(200);
    res.json(user); 
   
}

)]);






