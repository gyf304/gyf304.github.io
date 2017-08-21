So the sniffer part was complete. The server was the missing piece of the puzzle.

The server needs to do several things

  1. Receive data from the sniffer and decrypt
  2. Save sniffed data (probe requests) to a database
  3. Analyze probe requests and deduce occupancy
  4. Provide public APIs for retrieval of occupancy information

I'm using python3 for the server since it's one of the better-supported languages on Heroku. Unfortunately, XTEA implementations on python3 do not work well, so I reimplemented it by porting my embedded-C version. (One of the advantages of CTR mode is that the encrypting function is its own inverse. So encrypt == decrypt.) Sniffer MAC address and information of sniffed devices are recovered from decrypted data. These are stored to a DB after some simple processing (filtering out invalid MAC addresses, etc.).

For storage of probe requests, I use [sqlalchemy](http://www.sqlalchemy.org/) which is based on SQL. I didn't use one of the now-popular no-SQL databases since I'm not storing GBs of data. Also, enforcing schemas and relationships clears up the logic of the server. 

I also made a simple linear model to deduce occupancy from probe requests. The model is run every 30 seconds and output is stored back into the DB. It is not efficient to run the model every time a user asks for occupancy information. When a user requests occupancy, pre-computed occupancy is read from DB and directly sent to the user.

The public API is [RESTful](https://en.wikipedia.org/wiki/Representational_state_transfer) and based on simple JSON. I did not bother with pre-existing protocols like [JSONAPI 1.0](http://jsonapi.org/). These protocols are way too complicated and verbose for this project. When the cost of implementing a complicated protocol exceeds the potential benefits of that protocol, it's generally a good idea to steer away from it.

[Server Code on GitHub](https://github.com/gyf304/occupancy)
