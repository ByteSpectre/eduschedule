import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TeachersService } from './teachers.service';
import { TeachersController } from './teachers.controller';

@Module({
  imports: [PrismaModule],
  providers: [TeachersService],
  controllers: [TeachersController],
})
export class TeachersModule {}
