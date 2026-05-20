import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { ProjectsService } from './projects.service';
import { Project } from './entities/project.entity';
import { CreateProjectInput } from './dto/create-project.input';
import { UpdateProjectInput } from './dto/update-project.input';
import { ProjectStats } from './entities/project-stats.entity';
import { PasetoGuard } from 'src/auth/guard/paseto.guard';
import { UseGuards } from '@nestjs/common';

type GqlCtx = { req: { user: { sub: string } } };

@Resolver(() => Project)
export class ProjectsResolver {
  constructor(private readonly projectsService: ProjectsService) {}

  @UseGuards(PasetoGuard)
  @Mutation(() => Project)
  createProject(@Args('createProjectInput') input: CreateProjectInput, @Context() ctx: GqlCtx) {
    return this.projectsService.create(input, ctx.req.user.sub);
  }

  @UseGuards(PasetoGuard)
  @Mutation(() => Project)
  updateProject(
    @Args('id') id: string,
    @Args('updateProjectInput') input: UpdateProjectInput,
    @Context() ctx: GqlCtx,
  ) {
    return this.projectsService.update(id, input, ctx.req.user.sub);
  }

  @UseGuards(PasetoGuard)
  @Mutation(() => Boolean)
  deleteProject(@Args('id') id: string, @Context() ctx: GqlCtx) {
    return this.projectsService.remove(id, ctx.req.user.sub);
  }

  @UseGuards(PasetoGuard)
  @Query(() => [Project], { name: 'projects' })
  findAll(@Args('workspaceId') workspaceId: string, @Context() ctx: GqlCtx) {
    return this.projectsService.findAll(workspaceId, ctx.req.user.sub);
  }

  @UseGuards(PasetoGuard)
  @Query(() => Project, { name: 'project' })
  findOne(@Args('id') id: string, @Context() ctx: GqlCtx) {
    return this.projectsService.findOne(id, ctx.req.user.sub);
  }

  @UseGuards(PasetoGuard)
  @Query(() => ProjectStats, { name: 'projectStats' })
  projectStats(@Args('projectId') projectId: string) {
    return this.projectsService.getStats(projectId);
  }
}
