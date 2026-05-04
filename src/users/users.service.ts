import { Injectable, InternalServerErrorException, Logger, UnauthorizedException} from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';
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

type SafeUser = {
  id: string;
  name: string;
  email: string;
  nickname:string;
};


@Injectable()
export class UsersService {
  logger = new Logger(UsersService.name);
   constructor(
    @Inject(DRIZZLE) private db: DB,
    @Inject(PASETO_PRIVATE_KEY) private privateKey: string,
    @Inject(PASETO_PUBLIC_KEY) private publicKey: string,
  ) {}
  // -- create user
   async createUser(createUserInput: CreateUserInput) {
    try{
    const { name, lastname, birthdate, nickname, email, password } = createUserInput;
    const [user] = await this.db.insert(schema.users).values({
      name,
      nickname,
      email,
      password: await this.hashPassword(password),
      lastname,
      birthdate,
    }).returning();
    this.logger.log(`User created: ${user.id}`);
    return user;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Error creating user: ${error.message}`);
      }
      throw error; 
    } 
   }

   // --hash password
   async hashPassword(password: string): Promise<string> {
    try {
        const hash = await argon2.hash(password, {
            type: argon2.argon2id, 
            memoryCost: 65536,     
            timeCost: 3,           
            parallelism: 1         
        });
        return hash;
    } catch (err) {
        throw new InternalServerErrorException('Error al hashear la contraseña');
    }
  }
  
  // -- compare hash
  async verifyPassword(hash: string, password: string): Promise<boolean> {
    try {
        return await argon2.verify(hash, password);
    } catch (err) {
        throw new InternalServerErrorException('Error al verificar la contraseña');
    }
  }
  // -- start user
  async startUser(startUserInput: StartUserInput) {
    try{
    const { email, password } = startUserInput;
    const [user] = await this.db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .limit(1);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado o Contraseña incorrecta');
    }
    const isPasswordValid = await this.verifyPassword(user.password!, password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Usuario no encontrado o Contraseña incorrecta');
    }
    this.logger.log(`User logged in: ${user.id}`);
    
    const userSafe: SafeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      nickname: user.nickname
    };
    return this.createUserToken(userSafe);
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Error starting user: ${error.message}`);
      }
      throw error; 
    }
    
  }

  async createUserToken(user: SafeUser): Promise<LoginResponse> {
    const payload = {
      sub: user.id,
      email: user.email,
    };

    try {
      const token = await V4.sign(payload, this.privateKey, {
        expiresIn: '1h',
      });
      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          nickname: user.nickname
        } as AuthUser,
      };
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Error: ${error.message}`);
        this.logger.error(`Stack: ${error.stack}`);
      } else {
        this.logger.error(`Error: ${String(error)}`);
      }
      throw new InternalServerErrorException('Error al generar token');
    }
  }

  async deleteMe(idToDelete: string): Promise<String> {
    try{
    this.logger.log(`Attempting to delete user: ${idToDelete}`);
    const result = await this.db
      .delete(schema.users)
      .where(eq(schema.users.id, idToDelete));

    if (result.rowCount === 0) {
      this.logger.error(`User not found for deletion: ${idToDelete}`);
      return "User not found";
    }

    this.logger.log(`User deleted: ${idToDelete}`);
    return "User deleted successfully";
  } catch (error) {    if (error instanceof Error) {
      this.logger.error(`Error deleting user ${idToDelete}: ${error.message}`);
      this.logger.error(`Stack: ${error.stack}`);
    } else {
      this.logger.error(`Error deleting user ${idToDelete}: ${String(error)}`);
    }
    throw new InternalServerErrorException('Error al eliminar usuario');
  }
    // Daniel Useche
  }
}
