import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtGuard } from 'src/common/guards/auth.guard';
import { OwnerGuard } from 'src/common/guards/owner.guard';
import { BannedGuard } from 'src/common/guards/banned.guard';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { UserEntity } from './entities/user.entity';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('User')
@ApiBearerAuth('access-token')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Obtener detalles de un usuario específico' , description: 'Devuelve los detalles de un usuario específico a la que el usuario tiene acceso.' })
  @Get(':id')
  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(JwtGuard, OwnerGuard, BannedGuard)
  findOne(@Param('id') id: string): Promise<UserEntity> {
    return this.userService.findOne(id);
  }

  @ApiOperation({ summary: 'Actualizar un usuario específico' , description: 'Permite actualizar los detalles de un usuario específico a la que el usuario tiene acceso.' })
  @Patch(':id')
  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(JwtGuard, OwnerGuard, BannedGuard)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @ApiOperation({ summary: 'Eliminar un usuario específico' , description: 'Permite eliminar un usuario específico a la que el usuario tiene acceso.' })
  @Delete(':id')
  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(JwtGuard, OwnerGuard)
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
