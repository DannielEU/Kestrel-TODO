import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { WorksService } from './works.service';
import { Work } from './entities/work.entity';
import { CreateWorkInput } from './dto/create-work.input';

@Resolver(() => Work)
export class WorksResolver {
  constructor(private readonly worksService: WorksService) {}

  @Mutation(() => Work)
  createWork(@Args('createWorkInput') createWorkInput: CreateWorkInput) {
    return this.worksService.create(createWorkInput);
  }

  @Query(() => [Work], { name: 'works' })
  findAll() {
    return this.worksService.findAll();
  }
}
