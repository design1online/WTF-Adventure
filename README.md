![WTF?! Adventure](https://github.com/design1online/WTF-Adventure/blob/main/public/img/wtfadventure.png?raw=true "WTF?! Adventure")


![Node CI](https://github.com/design1online/WTF-Adventure/workflows/node%20ci/badge.svg) ![Code Coverage](https://img.shields.io/codecov/c/gh/design1online/WTF-Adventure) ![WTFPL](https://img.shields.io/static/v1?label=license&message=wtfpl--2.0&color=blueviolet) ![ESDocs Coverage](https://raw.githubusercontent.com/design1online/WTF-Adventure/main/docs/badge.svg?sanitize=true) ![Version](https://img.shields.io/github/package-json/v/design1online/WTF-Adventure)

WTF?! Adventure is a massively multi-player online open-source project based on Little Workshop's 2012 demonstration for HTML5 WebSockets - [BrowserQuest (BQ)](https://github.com/browserquest/BrowserQuest) and a subsequent fork called [Tap Tap Adventure (TTA)](https://github.com/phinolex/Tap-Tap-Adventure).
WTF?! Adventure is completely open-source, allowing its community to collaborate and aid in the perfection of the game. Anyone is free to create their own derivative of WTF?! Adventure, with no strings attached.

### Features & Functionality

- **NextJS:** Running on NextJS v13 and using App Router.

- **Typescript:** Now using typescript ;D

- **NodeJS:** Server has been updated to use nodemon for easier restarting and server development

- **Babel ES6:** All files updated to take advantage of newer JS functionality and class format

- **Testing:** Updated to use eslinter using airBnB standards

- **Styles:** Converted to allow the use of SASS

- **Dependencies:** All dependencies are now pulling from npm packages in package.json

- **Rendering:** Has been completely redone to only draw frames whenever necessary. This in turns boosts the performance on browsers such as Safari & Firefox.

- **Networking & Packets:** Previously, everything regarding networking was crammed into a singular class, now it has all been laid out properly with every class pertaining necessary functions.

- **Client Rework:** The stress put on the client previously was unbelievable, the client not only had to receive packet data, it was responsible for parsing music, achievements, quests, item data, and many other nonsense. This has all been moved to the server side, the client received information about whatever it needs from the server, removing upwards of 20MB of unnecessary data.

- **Source Structure:** Since everything has been rewritten from scratch, the code itself is located in designated files following a logical structure, as opposed to random scattered code throughout the source. As an extra, the convention remains unanimous throughout the source, ensuring maximum readability is achieved all throughout.

- **Database Loading:** Now uses MySQL as opposed to Redis. This is because MySQL is far more reliable. With this, the source is able to generate its own database structure regardless of the chosen MySQL server. Everything is stored in its according type and retrieved upon logging in.

- **Data Parser:** Located in `server/js/util/` the parser loads all data regarding NPCs, Mobs, Items and so on right when the server starts. It is then able to use it throughout the source statically.

- **Map Loading:** The client-sided map has been brought down to the bare minimum, it is only responsible for its fair share of collisions (checked both client and server sided) and determining tiles and what gets drawn where. While the server-side map loading ensures the location of objects, NPCs, areas and so on. The client receives information depending on the actions taken by the player (i.e. a player walks into a new zone and must receive new music)

- **Combat System:** Completely rewritten and much more controlled, the combat system accounts for both single, multi, ranged or melee combat. It can easily be expanded to include special mobs (e.g. bosses). It is all done in the server-side, greatly reducing the chance of any exploit.

- **Controllers:** Both the client and the server side contain a folder named `controllers`. The name is pretty self explanatory, this controls important functions of the game.

- **Quest System:** The quest controller encompasses both achievements and quests, both have been created in a plugin format and allow for manipulation of server events. Achievements are far more simplistic in nature, consisting of minor tasks and small rewards.

- **Plugin System:** Expands upon the controllers and combat and allows direct control over individual items.

- **Crypto:** removed this functionality

- **Graphics:** entirely new UI graphics

- **Doors:** enhanced to make going in and out of doors easier with mouse click functionality


## Todo List

- Better tutorial
- Advertisements
- Private Messages
- Passive Companions
- Active Companions
- Add Guilds and Parties
- Implement trading amongst player
- Abilities
- Finalize all bosses
- More quests and achievements


## Running WTF?! Adventure

Running the server is fairly straightforward, for the most part. If you already have everything installed and configured you can skip directly to step 3.

### Step 1 - Install the client dependencies

In the command line run: `npm install`

Open the `client/config.json` file and update the ports and settings to meet your needs.

### Step 2 - Install the server dependencies

In the command line run: `cd ./server && npm install`

Open the `server/config.json` file and update the ports and settings to meet your needs. The **secretKey** should be a strong password that has been [base62 encoded](http://encode-base62.nichabi.com/).

### Step 3 - Install MySQL

*Skip this step if you already have MySQL installed.*

**Windows**: Use [XAMP](https://www.apachefriends.org/index.html) or install [MySQL Shell](https://dev.mysql.com/doc/mysql-shell/8.0/en/mysql-shell-install-windows-quick.html).

**Mac**: Install [MAMP](https://www.mamp.info/en/) for a graphical user interface. Install [Homebrew](https://brew.sh/) then you can run the commands `npm run mac-install-mysql`

***nix**: Install using Apt `npm run apt-install-mysql` or Yum `npm run yum-install-mysql` or dnf `npm run dnf-install-mysql`

### Step 4 - Make sure MySQL is up and running

Start MySQL and make sure it's running.

**Windows**: Run XAMP or MySQL Shell

**Mac**: Run MAMP or if you installed using Homebrew run `npm run mac-mysql-start`

***nix**: Use `npm run nix-mysql-start`

### Step 5 - Run the NodeJS server

In the command line type: `npm run wtfserver`

### Step 6 - Run the NextJS app

If you've never run the project before then you need to build it first: `npm run build`

Once you have a build you can start the game using: `npm start`

### Step 7 - View in Browser

Now open your browser and navigate to `http://{ip}:{port}/` as defined in your client configuration file. Typically this will be `http://localhost:3000` if you use the default webpack and client configuration settings provided.

## Troubleshooting
* Typically errors with WTF Adventure are due to mysql connection or authentication issues in `server/config.json`.
  * If you are using XAMPP or MAMP the correct default values are already configured for you
  * Check that MySQL is running
  * Check that your hostname, port number, user name, password and database are correct
  * Check that your secretKey is base62 encoded
* Make sure you are running the correct IP and port in the client window in `client/config.json`
  * If you are using MAMP or XAMPP the correct default values are already configured for you
* Errors installing dependencies
  * When this happens you will need to look at the specific error you are getting from the dependency and try to resolve the issue
  * Sometimes these can be fixed by upgrading to the latest version or bumping back to a previous version
  * Try searching on Stack Overflow or in the GitHub repo click on the issues tab for the NPM package causing the issue to see if there is a possible solution
