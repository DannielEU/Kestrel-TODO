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
  @Mutation(() => Workspace)
  createWorkspace(@Args('createWorkspaceInput') createWorkspaceInput: CreateWorkspaceInput, @Context() context: { req: { user: { sub: string } } }) {
    return this.workspacesService.create(createWorkspaceInput, context.req.user.sub);
  }

  @UseGuards(PasetoGuard)
  @Query(() => [WorkspaceUser])
  findAll(@Context() context: { req: { user: { sub: string } } }) {
    return this.workspacesService.findAll(context.req.user.sub);
  }

}
