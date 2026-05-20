import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { WorkspacesService } from './workspaces.service';
import { Workspace, WorkspaceUser, WorkspaceMember, WorkspaceDetail } from './entities/workspace.entity';
import { WorkspaceStats } from './entities/workspace-stats.entity';
import { CreateWorkspaceInput } from './dto/create-workspace.input';
import { AddMemberInput } from './dto/add-member.input';
import { PasetoGuard } from 'src/auth/guard/paseto.guard';
import { UseGuards } from '@nestjs/common';

type GqlCtx = { req: { user: { sub: string } } };

@Resolver(() => Workspace)
export class WorkspacesResolver {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @UseGuards(PasetoGuard)
  @Mutation(() => Workspace)
  createWorkspace(
    @Args('createWorkspaceInput') input: CreateWorkspaceInput,
    @Context() ctx: GqlCtx,
  ) {
    return this.workspacesService.create(input, ctx.req.user.sub);
  }

  @UseGuards(PasetoGuard)
  @Mutation(() => Workspace)
  updateWorkspace(
    @Args('id') id: string,
    @Args('name') name: string,
    @Context() ctx: GqlCtx,
  ) {
    return this.workspacesService.update(id, name, ctx.req.user.sub);
  }

  @UseGuards(PasetoGuard)
  @Mutation(() => Boolean)
  deleteWorkspace(@Args('id') id: string, @Context() ctx: GqlCtx) {
    return this.workspacesService.remove(id, ctx.req.user.sub);
  }

  @UseGuards(PasetoGuard)
  @Query(() => [WorkspaceUser], { name: 'findAllWorkspaces' })
  findAll(@Context() ctx: GqlCtx) {
    return this.workspacesService.findAll(ctx.req.user.sub);
  }

  @UseGuards(PasetoGuard)
  @Query(() => WorkspaceDetail, { name: 'findOneWorkspace' })
  findOne(@Args('id') id: string, @Context() ctx: GqlCtx) {
    return this.workspacesService.findOne(id, ctx.req.user.sub);
  }

  @UseGuards(PasetoGuard)
  @Query(() => [WorkspaceMember], { name: 'workspaceMembers' })
  workspaceMembers(@Args('workspaceId') workspaceId: string) {
    return this.workspacesService.findMembers(workspaceId);
  }

  @UseGuards(PasetoGuard)
  @Mutation(() => Boolean)
  addUserToWorkspace(
    @Args('addMemberInput') input: AddMemberInput,
    @Context() ctx: GqlCtx,
  ) {
    return this.workspacesService.addMember(input, ctx.req.user.sub);
  }

  @UseGuards(PasetoGuard)
  @Mutation(() => Boolean)
  removeUserFromWorkspace(
    @Args('workspaceId') workspaceId: string,
    @Args('userId') userId: string,
    @Context() ctx: GqlCtx,
  ) {
    return this.workspacesService.removeMember(workspaceId, userId, ctx.req.user.sub);
  }

  @UseGuards(PasetoGuard)
  @Query(() => WorkspaceStats, { name: 'workspaceStats' })
  workspaceStats(@Args('workspaceId') workspaceId: string) {
    return this.workspacesService.getStats(workspaceId);
  }
}
