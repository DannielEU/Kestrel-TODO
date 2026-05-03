import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { PasetoService } from '../paseto/paseto.service';

@Injectable()
export class PasetoGuard implements CanActivate {
	constructor(private readonly pasetoService: PasetoService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const gqlContext = GqlExecutionContext.create(context).getContext();
		const request = gqlContext?.req;
		const authHeader = request?.headers?.authorization ?? '';

		if (!authHeader.startsWith('Bearer ')) {
			throw new UnauthorizedException('Token no encontrado');
		}

		const token = authHeader.slice('Bearer '.length).trim();
		if (!token) {
			throw new UnauthorizedException('Token no encontrado');
		}

		const payload = await this.pasetoService.verifyToken(token);
		request.user = payload;
		return true;
	}
}
