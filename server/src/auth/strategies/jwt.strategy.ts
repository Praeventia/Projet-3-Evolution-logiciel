import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWT_SECRET } from 'src/const';
import { UserClientSide } from 'src/users/schemas/users.schema';
import { UserID } from '../auth.module';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly authService: AuthService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: JWT_SECRET,
        });
    }

    async validate(payload: any): Promise<UserClientSide> {
        const tokenValidity = await this.authService.isTokenStillValid(payload.iat, payload._id);
        if(!tokenValidity) throw new UnauthorizedException();
        const data = await this.authService.userDataFromID({_id : payload._id} as UserID);
        return data;
    }
}
