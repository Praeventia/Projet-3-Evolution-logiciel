import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserClientSide } from 'src/users/schemas/users.schema';
import { UserID } from './auth.module';
import { ObjectId } from 'mongoose';



@Injectable()
export class AuthService {
    constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    ) {}

    async validateUserCredentials(email: string, pass: string): Promise<UserID> {
        const user = await this.usersService.findOneByEmail(email);
        if(user == null) return null;
        const isMatch=await bcrypt.compare(pass, user.password);
        if (isMatch) {          
            return {_id: user._id};
        }
        return null;
    }

    async login(userID: UserID): Promise<any> {
        const token=this.jwtService.sign(userID);
        const token_info=this.jwtService.verify(token);
        await this.usersService.updateUserLastLoginTime(userID._id.toString(), token_info.iat);
        return {
            access_token: token,
            expired_at : token_info.exp 
        };
    }

    extractDataFromPayload(payload: any): UserID {
        return { _id: payload._id } as UserID;
    }

    async isTokenStillValid(iat: number, _id:ObjectId): Promise<boolean>{
        const user_info=await this.usersService.findOneByID(_id);
        if(user_info == null) return false;
        if(iat < user_info.lastLoginTime) return false;
        return true;
    }

    async isUserConnected(token: string): Promise<UserClientSide | undefined> {
        if(token == null) return undefined;
        try{
            const payload=this.jwtService.verify(token);
            const data = this.extractDataFromPayload(payload);
            const tokenValidity= await this.isTokenStillValid(payload.iat, data._id);
            if(!tokenValidity) return undefined;
            const userData = await this.usersService.userDataForClientSide(data._id);
            return userData;
        }catch(error: any){
            return undefined;
        }
    }

    async userDataFromID(userID : UserID): Promise<UserClientSide> {
        const userData = await this.usersService.userDataForClientSide(userID._id);
        return userData;

    }
}
