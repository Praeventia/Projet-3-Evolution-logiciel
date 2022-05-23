import { IsString, IsNotEmpty} from 'class-validator';

export class SelectDefaultAvatarDto {
    @IsString()
    @IsNotEmpty()
    avatar: string;
}