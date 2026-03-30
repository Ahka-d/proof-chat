import { PartialType } from '@nestjs/swagger';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
    @ApiProperty({ example:"john_doe" ,description: 'Username of the user', required: false })
    username?: string;
    @ApiProperty({ example:"user@example.com" ,description: 'Email address of the user', required: false })
    email?: string;
    @ApiProperty({ example:"password123" ,description: 'Password of the user', required: false })
    password?: string;
}
