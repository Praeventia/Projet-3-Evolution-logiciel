import { IsString, IsNotEmpty} from 'class-validator';

export class SelectAvatarUsernameDto {
    @IsString()
    @IsNotEmpty()
    username: string;
}