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
import redis from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';


const main = async() =>{

  const orm = await MikroORM.init(mircoConfig);
  await orm.getMigrator().up()

  const app = express();

  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient();

  app.use(
    session({
      name: 'qid',
      store: new RedisStore({ 
        client: redisClient,
        disableTouch: true, 
      }),
      cookie:{
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        sameSite: 'lax', // csrf
        secure: __prod__ //cookie only works in https
      },
      saveUninitialized: false,
      secret: "env variable that i need to set later",
      resave: false
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [helloResolver, PostedResolver, UserResolver],
      validate: false
    }),
    context: ({req, res}) => ({em: orm.em, req, res})
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
