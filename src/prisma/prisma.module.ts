import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { config } from 'src/config/config';

@Module({
  imports: [ConfigModule.forFeature(config)],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
