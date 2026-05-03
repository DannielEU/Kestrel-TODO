import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export const PASETO_PRIVATE_KEY = 'PASETO_PRIVATE_KEY';
export const PASETO_PUBLIC_KEY = 'PASETO_PUBLIC_KEY';

export const privateKeyProvider: Provider = {
  provide: PASETO_PRIVATE_KEY,
  useFactory: (configService: ConfigService) =>
    configService.getOrThrow<string>('PRIVATE_KEY').trim(),
  inject: [ConfigService],
};

export const publicKeyProvider: Provider = {
  provide: PASETO_PUBLIC_KEY,
  useFactory: (configService: ConfigService) =>
    configService.getOrThrow<string>('PUBLIC_KEY').trim(),
  inject: [ConfigService],
};

export const PasetoKeyProviders = [privateKeyProvider, publicKeyProvider];