import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { RedisModule } from '../../redis/redis.module';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [RedisModule, ConfigModule],
    controllers: [AiController],
    providers: [AiService],
    exports: [AiService],
})
export class AiModule { }
