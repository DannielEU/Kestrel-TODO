import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { ProjectsService } from './projects.service';
import { Project } from './entities/project.entity';
import { CreateProjectInput } from './dto/create-project.input';
import { PasetoGuard } from 'src/auth/guard/paseto.guard';
import { UseGuards } from '@nestjs/common';

@Resolver(() => Project)
export class ProjectsResolver {
  constructor(private readonly projectsService: ProjectsService) {}

  @UseGuards(PasetoGuard)
  @Mutation(() => Project)
  createProject(@Args('createProjectInput') createProjectInput: CreateProjectInput, @Context() context: { req: { user: { sub: string } } }) {
    return this.projectsService.create(createProjectInput, context.req.user.sub);
  }

  @Query(() => [Project], { name: 'projects' })
  findAll(@Args('workspaceId') workspaceId: string) {
    return this.projectsService.findAll(workspaceId);
  }

}
