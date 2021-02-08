import { Post } from '../entities/Post'
import { MyContext } from '../types'
import {Resolver, Query, Ctx, Arg, Int, Mutation} from 'type-graphql'

@Resolver()
export class PostedResolver {

  @Query(() => [Post])
  posts(
    @Ctx() {em}: MyContext 
  ): Promise<Post[]>{
    return em.find(Post,{})
  }

  @Query(() => Post, {nullable: true})
  post(
    @Arg('id', ()=> Int) id: number,
    @Ctx() {em}: MyContext 
  ): Promise<Post | null>{
    return em.findOne(Post,{id})
  }
  
  @Mutation(() => Post)
  async createPost(
    @Arg('title', ()=> String) title: string,
    @Ctx() {em}: MyContext 
  ): Promise<Post>{
      const post = em.create(Post, {title})
      await em.persistAndFlush(post)
      return post;
  }

  @Mutation(() => Post)
  async updatePost(
    @Arg("id", ()=>Int) id: number,// id to look for
    @Arg('title', ()=> String, {nullable: true}) title: string, //post to update
    @Ctx() {em}: MyContext 
  ): Promise<Post | null>{
      const postToUpdate = await em.findOne(Post,{id});
      if(!postToUpdate){
        return null
      }
      if(typeof title !== 'undefined'){       
        postToUpdate.title = title;
        await em.persistAndFlush(postToUpdate);
      }
      return postToUpdate;
  }

  @Mutation(() => Boolean)
  async deletePost(
    @Arg('id', ()=> Int) id: number,
    @Ctx() {em} : MyContext
  ): Promise<boolean>{
    try{
      await em.nativeDelete(Post,{id})
      return true
    }catch{
      return false
    }
  }

}