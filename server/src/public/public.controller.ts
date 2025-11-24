import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import type {
  PublicBranch,
  PublicCity,
  PublicOrganization,
  PublicSchedule,
} from './public.service';
import { PublicService } from './public.service';

@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get('cities')
  getCities(): Promise<PublicCity[]> {
    return this.publicService.getCities();
  }

  @Get('organizations')
  getOrganizations(@Query('city') city?: string): Promise<PublicOrganization[]> {
    return this.publicService.getOrganizations(city);
  }

  @Get('branches')
  getBranches(
    @Query('organizationId') organizationId?: string,
  ): Promise<PublicBranch[]> {
    if (!organizationId) {
      throw new BadRequestException('organizationId is required');
    }
    return this.publicService.getBranches(organizationId);
  }

  @Get('schedules')
  getSchedules(@Query('branchId') branchId?: string): Promise<PublicSchedule[]> {
    if (!branchId) {
      throw new BadRequestException('branchId is required');
    }
    return this.publicService.getSchedules(branchId);
  }
}

