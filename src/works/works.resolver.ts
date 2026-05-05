import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { WorksService } from './works.service';
import { Work } from './entities/work.entity';
import { CreateWorkInput } from './dto/create-work.input';
import { PasetoGuard } from 'src/auth/guard/paseto.guard';
import { UseGuards } from '@nestjs/common';
import { WorksUsers } from './dto/worksUsers.dto';

@Resolver(() => Work)
export class WorksResolver {
  constructor(private readonly worksService: WorksService) {}
  @UseGuards(PasetoGuard) 
  @Mutation(() => Work)
  createWork(@Args('createWorkInput') createWorkInput: CreateWorkInput, @Context() context: { req: { user: { sub: string } } }) {
    return this.worksService.create(createWorkInput, context.req.user.sub);
  }
  @UseGuards(PasetoGuard)
  @Query(() => [WorksUsers], { name: 'works' })
  findAll(@Context() context: { req: { user: { sub: string } } }
  ) {
    return this.worksService.findAll(context.req.user.sub);
  }
}
