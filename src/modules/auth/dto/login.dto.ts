import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Correo electrónico del usuario',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'securePassword123',
    description: 'Contraseña del usuario (entre 8 y 50 caracteres)',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(50)
  password!: string;
}