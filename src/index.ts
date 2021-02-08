import 'reflect-metadata'
import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import mircoConfig from "./mikro-orm.config";
import express from "express";
import {ApolloServer} from 'apollo-server-express';
import {buildSchema} from "type-graphql";
import { PostedResolver } from "./resolvers/post";
import { helloResolver } from "./resolvers/postedResolver";

const main = async() =>{
  const orm = await MikroORM.init(mircoConfig);
  await orm.getMigrator().up()
  // const post = orm.em.create(Post, {title: "my first post!"})
  // await orm.em.persistAndFlush(post);

  // const post = await orm.em.find(Post,{})
  // console.log(post)
  const app = express();

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [helloResolver, PostedResolver],
      validate: false
    }),
    context: ()=> ({em: orm.em})
  })

  //creates a graphql endpoint on express
  apolloServer.applyMiddleware({app});

  app.listen(4000,()=>{
    console.log("server listening on port 4000")
  })
};

main().catch(err =>{
  console.error(err)
})
