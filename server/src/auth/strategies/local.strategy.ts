import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { UserID } from '../auth.module';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly authService: AuthService) {
        super({
            usernameField: 'email'
        });
    }

    async validate(email: string, password: string): Promise<UserID> {
        const user: UserID = await this.authService.validateUserCredentials(email, password);
        if (!user) {
            throw new HttpException('Information invalide', HttpStatus.UNAUTHORIZED);
        }
        return user;
    }
}
