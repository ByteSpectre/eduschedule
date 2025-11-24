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
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { SubjectsService } from './subjects.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN)
@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Get()
  findAll(@CurrentUser() user: User, @Query('search') search?: string) {
    if (!user.organizationId) {
      return [];
    }
    return this.subjectsService.findAll(user.organizationId, search);
  }

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateSubjectDto) {
    if (!user.organizationId) {
      throw new BadRequestException('Организация не найдена');
    }
    return this.subjectsService.create(user.organizationId, dto);
  }

  @Patch(':id')
  update(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: UpdateSubjectDto) {
    if (!user.organizationId) {
      throw new BadRequestException('Организация не найдена');
    }
    return this.subjectsService.update(user.organizationId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    if (!user.organizationId) {
      throw new BadRequestException('Организация не найдена');
    }
    return this.subjectsService.remove(user.organizationId, id);
  }
}
