#!/bin/bash
PORT="$1";

if [ -z "$PORT" ];
then
	echo "Usage: ./setup.bash OUT_PORT"
	echo "Hint: ./setup.bash 10000"
	exit 0
fi
# -------------------------------------------------------------------------
# Setup for the files here, though we already created a package.json file
# so you can actually get away with executing 
npm install

# -------------------------------------------------------------------------
# Here is what we did to set this all up...
# npm init creates a package.json
# http://browsenpm.org/package.json
# https://docs.npmjs.com/files/package.json
# Take the defaults here

# We are adding libraries, they will be in our local node_modules


npm install   express

# for post https://scotch.io/tutorials/use-expressjs-to-get-url-and-post-parameters
npm install   body-parser 

# http://www.sqlitetutorial.net/sqlite-nodejs/
npm install   sqlite3

npm install   ws

npm install JSON 

npm install  uuid 

sqlite3 db/database.db < db/schema.sql

echo "node ftd.js $PORT";
node ftd.js "$PORT"

