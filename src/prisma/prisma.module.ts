import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { config } from '../config/config';

@Module({
  imports: [ConfigModule.forFeature(config)],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
