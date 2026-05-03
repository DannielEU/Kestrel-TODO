import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import * as paseto from 'paseto';
import { PASETO_PUBLIC_KEY } from './paseto.provider';

const { V4 } = paseto;

type PasetoPayload = {
  sub: string;
  email: string;
  iat?: string;
  exp?: string;
};

@Injectable()
export class PasetoService {
  constructor(@Inject(PASETO_PUBLIC_KEY) private readonly publicKey: string) {}

  async verifyToken(token: string): Promise<PasetoPayload> {
    try {
      return await V4.verify<PasetoPayload>(token, this.publicKey);
    } catch (error) {
      throw new UnauthorizedException('Token invalido');
    }
  }
}
