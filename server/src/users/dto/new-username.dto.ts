import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { MAX_USERNAME_LENGTH } from 'src/const';

export class NewUsernameDto {
    @IsNotEmpty()
    @MaxLength(MAX_USERNAME_LENGTH)
    @IsString()
    username: string;
}