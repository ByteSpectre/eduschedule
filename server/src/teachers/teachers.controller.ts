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
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { TeachersService } from './teachers.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN)
@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Get()
  findAll(
    @CurrentUser() user: User,
    @Query('branchId') branchId?: string,
    @Query('search') search?: string,
  ) {
    if (!user.organizationId) {
      return [];
    }
    return this.teachersService.findAll(user.organizationId, branchId, search);
  }

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateTeacherDto) {
    if (!user.organizationId) {
      throw new BadRequestException('Организация не найдена');
    }
    return this.teachersService.create(user.organizationId, dto);
  }

  @Patch(':id')
  update(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: UpdateTeacherDto) {
    if (!user.organizationId) {
      throw new BadRequestException('Организация не найдена');
    }
    return this.teachersService.update(user.organizationId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    if (!user.organizationId) {
      throw new BadRequestException('Организация не найдена');
    }
    return this.teachersService.remove(user.organizationId, id);
  }
}
