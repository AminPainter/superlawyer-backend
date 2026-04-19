import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'generated/prisma/client';
import { config } from 'src/config/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(
    @Inject(config.KEY)
    envConfig: ConfigType<typeof config>,
  ) {
    super({
      adapter: new PrismaPg({ connectionString: envConfig.database.url }),
    });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
