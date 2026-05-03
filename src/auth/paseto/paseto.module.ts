import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PasetoKeyProviders } from './paseto.provider';
import { PasetoService } from './paseto.service';

@Module({
  imports: [ConfigModule],
  providers: [...PasetoKeyProviders, PasetoService],
  exports: [...PasetoKeyProviders, PasetoService],
})
export class PasetoModule {}