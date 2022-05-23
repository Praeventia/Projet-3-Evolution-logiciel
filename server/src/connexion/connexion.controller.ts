import { Body, Controller, Post, Put, Request, UseGuards } from '@nestjs/common';
import { UserID } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { LocalAuthGuard } from 'src/auth/guards/local-auth.guard';
import { UserClientSide } from 'src/users/schemas/users.schema';
import { UsersService } from 'src/users/users.service';
import { ConnexionService } from './connexion.service';
import { CreateProfilDto } from './dto/create-profil.dto';

@Controller('connexion')
export class ConnexionController {
    
    constructor(private readonly authService: AuthService, private readonly usersService: UsersService, private readonly connexionService: ConnexionService) {}

    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Request() req) {
        const userID: UserID = {_id: req.user._id};
        this.connexionService.onLogin(userID._id.toString());
        return this.authService.login(userID);
    }

    @Put('createProfile')
    async createProfil(@Body() createProfilDto: CreateProfilDto){
        const user: UserClientSide = await this.usersService.addUser(createProfilDto.username, createProfilDto.password, createProfilDto.email);
        this.connexionService.onCreateProfil(user._id);
        return user;
    }

    @UseGuards(JwtAuthGuard)
    @Post('disconnect')
    async disconnect(@Request() req) {
        this.connexionService.onDisconnect(req.user._id);
    }

}
