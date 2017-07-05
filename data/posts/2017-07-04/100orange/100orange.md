Full title:

# Hacking 100% Orange Juice to open multiple instances of the game.

I recently got the game 100% Orange Juice, and as a board game it doesn't support local multiplayer. It does have a online multiplayer though. So the idea is to run multiple instances of the game, and use the online multiplayer mode to "simulate" local multiplayer. However, it doesn't event want to you to run multiple instances. That's a bummer.

So I open up the trusty OllyDbg and trace the startup of the game. 15 minutes later I found that "Game is already running" check is performed at offset 0x00B31033, almost at the very beginning of the exe. Based on the result, at 0x00B3103B, the program either jumps to 0x00B31056 to continue execution, or gives you an error message and crash. We certainly don't want the latter.

![img1](data/posts/2017-07-04/100orange/img1.jpg)

The operation at 0x00B3103B is JE SHORT 00B31056 (74 19), simply change that to JMP SHORT 00B31056 (EB 19) and it is fixed.

However, I later figured out that the multiplayer mode is implemented using Steam API, which again does not allow multiple instances to go online simutanously. Hacking the Steam API or to decouple the game from Steam API is a much bigger project which I decided to step away from. 

So it turned out that I still can't do local multiplayer with this game.
