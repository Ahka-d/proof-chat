import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Render } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';

@ApiTags('Admin Dashboard')
@ApiBearerAuth('access-token')
@Controller('admin/stats')
export class AdminController {
  constructor(private readonly statsService: AdminService) {}

  @Get('summary')
  @Render('dashboard')
  @ApiOperation({ summary: 'Obtener todas las métricas del dashboard administrativo' })
  @ApiResponse({ 
    status: 200, 
    description: 'Retorna un objeto con conteos, tops y comparativas de mensajes.' 
  })
  async getSummary() {
    const stats = await this.statsService.getDashboardStats();
    return { stats };
  }
}
  
