import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { WorkspacesService } from './workspaces.service';
import { Workspace, WorkspaceUser } from './entities/workspace.entity';
import { CreateWorkspaceInput } from './dto/create-workspace.input';
import { PasetoGuard } from 'src/auth/guard/paseto.guard';
import { UseGuards } from '@nestjs/common';


@Resolver(() => Workspace)
export class WorkspacesResolver {
  constructor(private readonly workspacesService: WorkspacesService) {}
  
  @UseGuards(PasetoGuard)
  @Mutation(() => Workspace, { name: 'createWorkspace' })
  createWorkspace(@Args('createWorkspaceInput') createWorkspaceInput: CreateWorkspaceInput, @Context() context: { req: { user: { sub: string } } }) {
    return this.workspacesService.create(createWorkspaceInput, context.req.user.sub);
  }

  @UseGuards(PasetoGuard)
  @Query(() => [WorkspaceUser], { name: 'findAllWorkspaces' })
  findAll(@Context() context: { req: { user: { sub: string } } }) {
    return this.workspacesService.findAll(context.req.user.sub);
  }

  @UseGuards(PasetoGuard)
  @Query(() => Workspace, { name: 'findOneWorkspace' })
  findOne(@Args('id', { type: () => Int }) id: number, @Context() context: { req: { user: { sub: string } } }) {
    return this.workspacesService.findOne(id, context.req.user.sub);
  }

}
