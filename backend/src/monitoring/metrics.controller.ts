// src/monitoring/metrics.controller.ts

import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrometheusController } from '@willsoto/nestjs-prometheus';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { Request, Response } from 'express'; // Ensure these imports match your HTTP framework

@ApiTags('monitoring')
@Controller('metrics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class MetricsController extends PrometheusController {
  @Get()
  @ApiOperation({ summary: 'Get application metrics' })
  getMetrics(@Req() req: Request, @Res() res: Response) {
    return super.index(req); // Pass the required arguments
  }
}
