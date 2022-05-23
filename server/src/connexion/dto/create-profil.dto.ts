import { IsString, MaxLength, IsNotEmpty, IsEmail } from 'class-validator';
import { MAX_USERNAME_LENGTH } from 'src/const';

export class CreateProfilDto {

    @IsNotEmpty()
    @MaxLength(MAX_USERNAME_LENGTH)
    @IsString()
    username: string;

    @IsNotEmpty()
    @IsString()
    password: string;

    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email: string;
}