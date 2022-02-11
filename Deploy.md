# How to compile & Deploy
The project is using Typescript as main language and not other dependencies on external libraries (everything is already included).

# Compilation
The first step will be to compile the typescript code into javascript code so browsers will be able to understand it. 
You also need to build some files that are dynamically generated like the manifest ...
This task is doable with :
```
npm install
node ./node_modules/typescript/bin/tsc --project tsconfig.prod.json
node build.js
```
The first task install dependencies (typescript) and the text one compile the typescript code.
We are using a custom tsconfig file which is optimized for production.

# Change configuration
You will have to edit the file src/config.js in order to change the API URLs to your nodes. 

That's all

# Deploy
All the content of the src directory needs to be exposed with a web-server.

