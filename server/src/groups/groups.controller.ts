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
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { GroupsService } from './groups.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN)
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  findAll(
    @CurrentUser() user: User,
    @Query('branchId') branchId?: string,
    @Query('search') search?: string,
  ) {
    if (!user.organizationId) {
      return [];
    }
    return this.groupsService.findAll(user.organizationId, branchId, search);
  }

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateGroupDto) {
    if (!user.organizationId) {
      throw new BadRequestException('Организация не найдена');
    }
    return this.groupsService.create(user.organizationId, dto);
  }

  @Patch(':id')
  update(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: UpdateGroupDto) {
    if (!user.organizationId) {
      throw new BadRequestException('Организация не найдена');
    }
    return this.groupsService.update(user.organizationId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    if (!user.organizationId) {
      throw new BadRequestException('Организация не найдена');
    }
    return this.groupsService.remove(user.organizationId, id);
  }
}
