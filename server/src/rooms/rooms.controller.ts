import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import type { User } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RoomsService } from './rooms.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN)
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  findAll(
    @CurrentUser() user: User,
    @Query('branchId') branchId?: string,
    @Query('search') search?: string,
  ) {
    if (!user.organizationId) {
      return [];
    }
    return this.roomsService.findAll(user.organizationId, branchId, search);
  }

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateRoomDto) {
    if (!user.organizationId) {
      throw new BadRequestException('Организация не найдена');
    }
    return this.roomsService.create(user.organizationId, dto);
  }

  @Patch(':id')
  update(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: UpdateRoomDto) {
    if (!user.organizationId) {
      throw new BadRequestException('Организация не найдена');
    }
    return this.roomsService.update(user.organizationId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    if (!user.organizationId) {
      throw new BadRequestException('Организация не найдена');
    }
    return this.roomsService.remove(user.organizationId, id);
  }
}
