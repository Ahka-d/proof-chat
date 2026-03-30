import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class SigninDto {
  
  @ApiProperty({
    example: 'user@example.com',
    description: 'Correo electrónico del usuario',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'john_doe',
    description: 'Nombre de usuario',
  })
  @IsString()
  @MaxLength(50)
  username!: string;

  @ApiProperty({
    example: 'securePassword123',
    description: 'Contraseña del usuario',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(50)
  password!: string;
}