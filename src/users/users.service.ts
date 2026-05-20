import {
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateMeInput } from './dto/update-me.input';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../database/schema';
import { DRIZZLE } from 'src/database/drizzle.provider';
import { Inject } from '@nestjs/common';
import * as argon2 from 'argon2';
import { StartUserInput } from './dto/start-user';
import { eq } from 'drizzle-orm';
import { PASETO_PRIVATE_KEY, PASETO_PUBLIC_KEY } from 'src/auth/paseto/paseto.provider';
import * as paseto from 'paseto';
import { AuthUser, LoginResponse } from './entities/user.model';

const { V4 } = paseto;
type DB = NodePgDatabase<typeof schema>;

type SafeUser = { id: string; name: string; email: string; nickname: string };

@Injectable()
export class UsersService {
  logger = new Logger(UsersService.name);

  constructor(
    @Inject(DRIZZLE) private db: DB,
    @Inject(PASETO_PRIVATE_KEY) private privateKey: string,
    @Inject(PASETO_PUBLIC_KEY) private publicKey: string,
  ) {}

  async createUser(input: CreateUserInput) {
    const { name, lastname, birthdate, nickname, email, password } = input;
    const [existing] = await this.db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);
    if (existing) throw new ConflictException('Email already in use');

    const [user] = await this.db
      .insert(schema.users)
      .values({
        name,
        nickname,
        email,
        password: await this.hashPassword(password),
        lastname,
        birthdate,
      })
      .returning();
    this.logger.log(`User created: ${user.id}`);
    return user;
  }

  async me(userId: string) {
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateMe(userId: string, input: UpdateMeInput) {
    const values: Partial<typeof schema.users.$inferInsert> = {};
    if (input.name !== undefined) values.name = input.name;
    if (input.lastname !== undefined) values.lastname = input.lastname;
    if (input.nickname !== undefined) {
      const [taken] = await this.db
        .select({ id: schema.users.id })
        .from(schema.users)
        .where(eq(schema.users.nickname, input.nickname))
        .limit(1);
      if (taken && taken.id !== userId)
        throw new ConflictException('Nickname already taken');
      values.nickname = input.nickname;
    }
    const [updated] = await this.db
      .update(schema.users)
      .set(values)
      .where(eq(schema.users.id, userId))
      .returning();
    return updated;
  }

  async hashPassword(password: string): Promise<string> {
    try {
      return await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 1,
      });
    } catch {
      throw new InternalServerErrorException('Error hashing password');
    }
  }

  async verifyPassword(hash: string, password: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, password);
    } catch {
      throw new InternalServerErrorException('Error verifying password');
    }
  }

  async startUser(input: StartUserInput) {
    const { email, password } = input;
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await this.verifyPassword(user.password!, password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    this.logger.log(`User logged in: ${user.id}`);
    return this.createUserToken({ id: user.id, name: user.name, email: user.email, nickname: user.nickname });
  }

  async createUserToken(user: SafeUser): Promise<LoginResponse> {
    try {
      const token = await V4.sign({ sub: user.id, email: user.email }, this.privateKey, {
        expiresIn: '8h',
      });
      return {
        token,
        user: { id: user.id, email: user.email, name: user.name, nickname: user.nickname } as AuthUser,
      };
    } catch {
      throw new InternalServerErrorException('Error generating token');
    }
  }

  async deleteMe(idToDelete: string): Promise<string> {
    const result = await this.db.delete(schema.users).where(eq(schema.users.id, idToDelete));
    if ((result.rowCount ?? 0) === 0) throw new NotFoundException('User not found');
    return 'User deleted successfully';
  }
}
