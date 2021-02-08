import 'reflect-metadata'
import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import mircoConfig from "./mikro-orm.config";
import express from "express";
import {ApolloServer} from 'apollo-server-express';
import {buildSchema} from "type-graphql";
import { PostedResolver } from "./resolvers/post";
import { helloResolver } from "./resolvers/postedResolver";
import { UserResolver } from './resolvers/user';

const main = async() =>{

  const orm = await MikroORM.init(mircoConfig);
  await orm.getMigrator().up()

  const app = express();

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [helloResolver, PostedResolver, UserResolver],
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
