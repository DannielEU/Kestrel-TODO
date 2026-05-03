import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { CreateUserInput } from './dto/create-user.input';
import { LoginResponse, User } from './entities/user.model';
import { StartUserInput } from './dto/start-user';
import { Req, UseGuards } from '@nestjs/common';
import { PasetoGuard } from 'src/auth/guard/paseto.guard';
@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(PasetoGuard)
  @Query(() => String)
  hello() {
    return 'Hello World!';
  }

  @Mutation(() => User!)
  createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.usersService.createUser(createUserInput);
  }
  @Mutation(() => LoginResponse)
  startUser(@Args('startUserInput') startUserInput: StartUserInput) {
    return this.usersService.startUser(startUserInput);
  }

  @UseGuards(PasetoGuard)
  @Mutation(() => String!)
  deleteMe(@Context() context: { req: { user: { sub: string } } }) {
  return this.usersService.deleteMe(context.req.user.sub);
}
}
