import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { WorksService } from './works.service';
import { Work, WorkWithAssignees } from './entities/work.entity';
import { CreateWorkInput } from './dto/create-work.input';
import { UpdateWorkInput } from './dto/update-work.input';
import { PasetoGuard } from 'src/auth/guard/paseto.guard';
import { UseGuards } from '@nestjs/common';
import { WorksUsers } from './dto/worksUsers.dto';

type GqlCtx = { req: { user: { sub: string } } };

@Resolver(() => Work)
export class WorksResolver {
  constructor(private readonly worksService: WorksService) {}

  @UseGuards(PasetoGuard)
  @Mutation(() => Work)
  createWork(
    @Args('createWorkInput') input: CreateWorkInput,
    @Context() ctx: GqlCtx,
  ) {
    return this.worksService.create(input, ctx.req.user.sub);
  }

  @UseGuards(PasetoGuard)
  @Mutation(() => Work)
  updateWork(
    @Args('id') id: string,
    @Args('updateWorkInput') input: UpdateWorkInput,
    @Context() ctx: GqlCtx,
  ) {
    return this.worksService.update(id, input, ctx.req.user.sub);
  }

  @UseGuards(PasetoGuard)
  @Mutation(() => Boolean)
  deleteWork(@Args('id') id: string, @Context() ctx: GqlCtx) {
    return this.worksService.delete(id, ctx.req.user.sub);
  }

  @UseGuards(PasetoGuard)
  @Query(() => [WorksUsers], { name: 'myWorks' })
  myWorks(@Context() ctx: GqlCtx) {
    return this.worksService.findAll(ctx.req.user.sub);
  }

  @UseGuards(PasetoGuard)
  @Query(() => [WorkWithAssignees], { name: 'worksByProject' })
  worksByProject(@Args('projectId') projectId: string) {
    return this.worksService.findByProject(projectId);
  }

  @UseGuards(PasetoGuard)
  @Mutation(() => Boolean)
  assignUserToWork(
    @Args('workId') workId: string,
    @Args('userId') userId: string,
  ) {
    return this.worksService.assignUser(workId, userId);
  }

  @UseGuards(PasetoGuard)
  @Mutation(() => Boolean)
  unassignUserFromWork(
    @Args('workId') workId: string,
    @Args('userId') userId: string,
  ) {
    return this.worksService.unassignUser(workId, userId);
  }
}
