import { User } from '../entities/User';
import { MyContext } from 'src/types';
import {Resolver, Mutation, Arg, Field, InputType, Ctx, ObjectType} from 'type-graphql';
import argon2 from "argon2";

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string
  @Field()
  password: string
}

@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], {nullable: true})
  errors?: FieldError[];

  @Field(()=> User, {nullable: true})
  user?: User;
}

@Resolver()
export class UserResolver {
  @Mutation(()=> UserResponse)
  async register(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() {em} : MyContext
  ):Promise<UserResponse>{
    // basic username validation
    if(options.username.length <=2){
      return {
        errors: [
          {
            field: "username",
            message: "username must be longer atleast 3 characters long"
          },
        ]
      }
    }
    // basic password validation
    if(options.password.length <=3){
      return {
        errors: [
          {
            field: "password",
            message: "password must be longer atleast 4 characters long"
          },
        ]
      }
    }
    const hashedPassword = await argon2.hash(options.password)
    const user = em.create(User,{
      username: options.username,
      password: hashedPassword
    });
    try{
      await em.persistAndFlush(user);
    }catch(err){

      //catche duplicate usernames
      
      if(err.code === "23505" || err.detail.includes('already exist')){
        return {
          errors: [
            {
              field: "username",
              message: "username already taken"
            }
          ]
        }
      }
      console.log('message:', err.message)
    }
    return {
      user,
    }
  }

  @Mutation(()=> UserResponse)
  async login(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() {em}: MyContext
  ):Promise<UserResponse>{
    const user = await em.findOne(User,{username: options.username});
    if(!user){
      return{
        errors: [{
          field: "username",
          message: "that username does not exist",
        },
      ]
    };
  }
    const valid = await argon2.verify(user.password, options.password);
    if(!valid){
      return{
        errors: [
          {
            field: "password",
            message: 'incorrect password',
          }
        ],
      };
    }
    return {
      user,
    }
  }
}