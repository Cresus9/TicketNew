import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketTypeDto, UpdateTicketTypeDto } from './dto/ticket-type.dto';
import { ValidateTicketDto } from './dto/ticket.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';

@ApiTags('tickets')
@Controller('tickets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post('types')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new ticket type' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Ticket type created successfully' })
  async createTicketType(@Body() createTicketTypeDto: CreateTicketTypeDto) {
    return this.ticketsService.createTicketType(createTicketTypeDto);
  }

  @Put('types/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update a ticket type' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Ticket type updated successfully' })
  async updateTicketType(
    @Param('id') id: string,
    @Body() updateTicketTypeDto: UpdateTicketTypeDto
  ) {
    return this.ticketsService.updateTicketType(id, updateTicketTypeDto);
  }

  @Post('validate')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Validate a ticket' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Ticket validation result' })
  async validateTicket(@Body() validateTicketDto: ValidateTicketDto) {
    return this.ticketsService.validateTicket(validateTicketDto.qrCode);
  }

  @Post(':id/use')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Mark a ticket as used' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Ticket marked as used' })
  async markTicketAsUsed(@Param('id') id: string) {
    return this.ticketsService.markTicketAsUsed(id);
  }
}