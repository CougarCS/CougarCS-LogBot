# CougarCS-LogBot

CougarCS-LogBot is an Discord bot that helps CougarCS volunteers log their hours.

## Installation

You'll need to have the NodeJS 11.0.0+ and Python 3.7+ to edit or run this project. You can get those here:

* https://www.python.org/downloads/
* https://nodejs.org/en/

Download this repo by navigating to your desired destination via your terminal, and running this command:

```
git clone https://github.com/Adil-Iqbal/CougarCS-LogBot.git
```

Navigate into the directory and create a virtual environment. You can name it whatever you like, I've named it `venv` in the example below.

```
cd CougarCS-LogBot
python -m venv venv
source venv/bin/activate 
```

Note: The last command activates your virtual environment. I'm using Linux, it's different for other platforms. 

See for full explanation: https://www.infoworld.com/article/3239675/virtualenv-and-venv-python-virtual-environments-explained.html

Next, install python and node dependencies:

``` 
pip install -r requirements.txt
npm install
```

NOTE: If installing `requirements.txt` does not work, try installing dependencies manually: `pip install flask flask_api flask_pymongo bson python-dateutil`

## Setup
This entire setup section is here because you'll need a `.env` file that follows the structure in the `.env.sample` file in the root project directory. The `.env` file contains a ton of sensitive information, so I can't share it with you. However, you can create your own `.env` file if you'd like to run this bot elsewhere. Place the `.env` in the same directory as the `.env.sample` file.

### Bot Token & Client ID
You'll need a bot token, this token will tell your bot to run the code in this repo. You will also need a client ID so you can invite the bot to run on your Discord server. To get a token & client ID, you can follow this guide:

https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot

Once you have the token, it goes in your `.env` file under `BOT_TOKEN`.  Save the Client ID! We'll need it in the 'Usage' section.

### Channel IDs
This bot references a few Discord channels, and to use this bot yourself you'll need to have the IDs for those channels. In discord, on the bottom right hand corner, click the cog wheel next to your name to take you to your User Settings page.

![discord user settings](https://i.imgur.com/IKTpOjd.png)

On the side menu, scroll *all the way down*. Near the bottom of the side menu, you'll see an "Appearance" tab. Click it and scroll *all the way down* until you see the option for developer mode. Turn that slider on. 

![discord dev mode](https://i.imgur.com/JLUw7bO.png)

Now go back to normal discord. Whenever you right-click on a user, server, or channel, you should now see the option 'Copy ID' in red. Place the ID's for three channels in your `.env` file for `CHANNEL_ID`, `BOT_BUILDER_CHANNEL_ID`, and `CHAT_CHANNEL_ID`. The `CHANNEL_ID` will be the target channel that your bot will live in.


### Mongo URI
You'll need a MongoDB account which you can get for free with 500 MB of storage (at the time of this writing). You can get that here: https://www.mongodb.com/try

Log into your account, create a cluster, and retrieve the Mongo URI. When retrieving the URI, select "Python" for the driver and "3.4 or later" for the version. Copy the URI and place it in your `.env` file under `MONGO_URI`.

### Configuration ID
Once you have a mongo database in your cluster, you'll need to create a collection called `config`. This collection will hold exactly 1 document. That document should look exactly like the `./bot/config.json` file. 

Since your collection is currently empty, you'll have to create it manually through Mongo Atlas. Once the document is made, place the `ObjectId` for that document in your `.env` file under `CONFIG_OBJECT_ID`.

### Host

Set the `HOST` in your `.env` to your local host. No slashes at the end! Here's an example:

```
HOST='http://12.0.0.1:5000'
```

## Usage

### Inviting the Bot to your Server
Sign in to discord.

You'll need a link to invite the bot to your server. Use the client ID you got during the Setup section above and construct the link like so:

"https://discord.com/oauth2/authorize?client_id=" + **CLIENT ID** + "&scope=bot&permissions=261185"

Now click on the link with the client ID and follow discord's instructions. 

### Running the Bot

The bot and the API run in two separate terminal sessions. You can run the bot via the following command:

```
node bot/index.js
```
You can run the API by first ensuring your virtual environment is active, and then running flask. 


```
flask run
```

To verify that everything is running, check your discord server. You should see a user named "CougarCS-LogBot" under the online section.

![LogBot Online](https://i.imgur.com/Bki4QPI.png)

## Contributing

Discussion in #bot-builder channel!
https://discord.gg/CwkF3R7

The bot is being developed here!
https://discord.gg/JRpxan8

## License
[MIT](https://choosealicense.com/licenses/mit/)
