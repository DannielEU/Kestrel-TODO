import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateMeInput } from './dto/update-me.input';
import { LoginResponse, User } from './entities/user.model';
import { StartUserInput } from './dto/start-user';
import { UseGuards } from '@nestjs/common';
import { PasetoGuard } from 'src/auth/guard/paseto.guard';

type GqlCtx = { req: { user: { sub: string } } };

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(PasetoGuard)
  @Query(() => User, { name: 'me' })
  me(@Context() ctx: GqlCtx) {
    return this.usersService.me(ctx.req.user.sub);
  }

  @Mutation(() => User)
  createUser(@Args('createUserInput') input: CreateUserInput) {
    return this.usersService.createUser(input);
  }

  @Mutation(() => LoginResponse)
  startUser(@Args('startUserInput') input: StartUserInput) {
    return this.usersService.startUser(input);
  }

  @UseGuards(PasetoGuard)
  @Mutation(() => User)
  updateMe(
    @Args('updateMeInput') input: UpdateMeInput,
    @Context() ctx: GqlCtx,
  ) {
    return this.usersService.updateMe(ctx.req.user.sub, input);
  }

  @UseGuards(PasetoGuard)
  @Mutation(() => String)
  deleteMe(@Context() ctx: GqlCtx) {
    return this.usersService.deleteMe(ctx.req.user.sub);
  }
}
