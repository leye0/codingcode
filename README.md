# Codingcode: another small program like AutoGPT

This is an autonomous agent that creates code, app, games, text, whatever we ask it for.

I've made this small app to test the possibilities with autonomous agents and automatic code generation. It does't follow the auto-gpt prompt standard, but kinda works.

## Getting started

### Installation

- npm install
- cp .env_template .env
- Open the .env file
- Add your OpenAI API key
- Add your Google Custom Search API key [see instructions below]
- Add your Google Custom Search Engine ID [see instructions below]

### Usage

To launch it type:
node main.js

It will ask you for the project name, which will create your new project folder within the "workspaces" folder.

It will then ask you for a small description of the project, which you will fill with a 2-5 sentences description.

Examples:

I want you to create a functional, fully implemented tic-tac-toe game with an AI and nice colors, in javascript and html.

I want you to create a hello world website in PHP.

### Create a Custom Search Engine (it's free!)

To (legally) call Google from an API call, you can create a custom search engine.

To create the Google Custom Search Engine:
https://programmablesearchengine.google.com/controlpanel/all

Copy the Engine ID and paste it in GOOGLE_CUSTOM_SEARCH_ENGINE_ID

To create the Google Custom Search API key:
https://console.cloud.google.com/apis/api/customsearch.googleapis.com/metrics

Click "Create credentials"
Copy your API key and paste it in GOOGLE_CUSTOM_SEARCH_API_KEY

## Proompting!

Write your detailed prompt:

    "You will create a fully playable checkers game in vanilla js and html. The game will look very good and similar to a real board game in real life thanks to css like box-shadow, gradients and animations, and you will use colors that look like the real game so that it looks very neat. The grid should have alternate dark/light colored squares like the real game. We should play against an AI that is really good at checker and never losts. When we - the human player - or the opponent will win, lose, are will be in a draw game, i.e. if there is no more possible move, then you will display a message on the screen about the winner of the game, and it will be possible to Start a new game. The DOM of the grid should be generated dynamically, as well as the pieces. Everything should be fully implemented. Make sure that the DOM is fully loaded before generating the DOM. Make sure to use very specific CSS rules so that everything is visible. Note that it is very important for you think a lot about the rules of the game before proceeding, so think about all the logic involved in the game rules before starting to design the game."

Then exclude all the steps that are too "meta" to be executed by the AI. (Ex: debug the game, publish the game, etc)
Note that this 'cleansing' step is done manually to leave you the liberty to (try to) implement them autonomously if you are brave enough.

GPT can make bad engineering choices. If it happens, give it better instruction.

As an example, when generating a board game, GPT can sometime not think that it is able to generate the grid dynamically, and create an index.html with 64 elements, or even with placeholders. In this case, you need to remember that when generating a board game, you have to specify that the grid should be generated dynamically.

Sometime, GPT renders a really good result, but sometime, it will get lost in details - hence the particular standard in autonomous agents like like auto-gpt.

## Technical

🚧 It is a work in progress, currently written using the worst coding styles. 🚧
I'm using // @ts-check comments at the top of the file so that I have a minimum of typing while coding.

Don't pay attention to the mess!
