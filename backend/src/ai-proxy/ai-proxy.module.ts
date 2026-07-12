import { Module } from '@nestjs/common';
import { AiProxyService } from './ai-proxy.service';
import { AiProxyController } from './ai-proxy.controller';

@Module({
  providers: [AiProxyService],
  controllers: [AiProxyController],
  exports: [AiProxyService],
})
export class AiProxyModule {}
