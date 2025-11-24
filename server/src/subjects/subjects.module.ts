import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SubjectsService } from './subjects.service';
import { SubjectsController } from './subjects.controller';

@Module({
  imports: [PrismaModule],
  providers: [SubjectsService],
  controllers: [SubjectsController],
})
export class SubjectsModule {}
