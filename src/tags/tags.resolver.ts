import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { TagsService } from './tags.service';
import { Tag } from './tag.entity';
import { CreateTagInput } from './dto/create-tag.input';
import { PasetoGuard } from 'src/auth/guard/paseto.guard';

type GqlCtx = { req: { user: { sub: string } } };

@Resolver(() => Tag)
export class TagsResolver {
  constructor(private readonly tagsService: TagsService) {}

  @UseGuards(PasetoGuard)
  @Query(() => [Tag], { name: 'workspaceTags' })
  findByWorkspace(@Args('workspaceId') workspaceId: string) {
    return this.tagsService.findByWorkspace(workspaceId);
  }

  @UseGuards(PasetoGuard)
  @Mutation(() => Tag)
  createTag(@Args('createTagInput') input: CreateTagInput, @Context() ctx: GqlCtx) {
    return this.tagsService.create(input, ctx.req.user.sub);
  }

  @UseGuards(PasetoGuard)
  @Mutation(() => Boolean)
  deleteTag(@Args('id') id: string, @Context() ctx: GqlCtx) {
    return this.tagsService.delete(id, ctx.req.user.sub);
  }

  @UseGuards(PasetoGuard)
  @Mutation(() => Boolean)
  addTagToWork(@Args('workId') workId: string, @Args('tagId') tagId: string) {
    return this.tagsService.addToWork(workId, tagId);
  }

  @UseGuards(PasetoGuard)
  @Mutation(() => Boolean)
  removeTagFromWork(@Args('workId') workId: string, @Args('tagId') tagId: string) {
    return this.tagsService.removeFromWork(workId, tagId);
  }
}
