import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { SigninDto } from './dto/signin.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common/exceptions';
import { ResponseLoginDto } from './dto/responselogin.dt';

@Injectable()
export class AuthService {
   constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async signin(signinDto: SigninDto) {
    const { email, username, password } = signinDto;
    try {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existingUser) {
      return new UnauthorizedException('El usuario ya existe');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await this.prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
      },
    });

    const payload = { sub: newUser.id, email: newUser.email, username: newUser.username, role: "USER", isBanned: false, isOnline: false };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: { id: newUser.id, email: newUser.email, username: newUser.username }
    } as ResponseLoginDto;
    } catch (error) {
      console.error('Error during user registration:', error);
      throw new UnauthorizedException('Error al registrar el usuario');
    }
  }
  
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    try {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { sub: user.id, email: user.email, username: user.username, role: user.role, isBanned: user.isBanned, isOnline: user.isOnline };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: { id: user.id, email: user.email, username: user.username } 
    } as ResponseLoginDto;
    } catch (error) {
      console.error('Error during user login:', error);
      throw new UnauthorizedException('Error al iniciar sesión');
    }
  }

  async verifyJwt(jwt: string) {
    const token = jwt;
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      const user: { id: string; email: string; username: string; isBanned: boolean; role: string; isOnline: boolean } | null = await this.prisma.user.findUnique({
        where: { id: payload.sub },
          select: {
            email: true,
            username: true,
            isBanned: true,
            role: true,
            isOnline: true,
            id: true 
          },
      });

      if (!user) return null;

      return user;
    } catch (error) {
      console.error('JWT verification failed:', error);
      return null;
    }
  }
}
