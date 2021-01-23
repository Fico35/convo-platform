# convo-platform

Small nodejs package that **should** (*hopefully*) make building chatbots easier.

### Installation

This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/).

Before installing, [download and install Node.js](https://nodejs.org/en/download/).
Node.js v8 or higher is required.

Install the package using the [`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):

```bash
$ npm install convo-platform
```


### Features

* State definition
* State import/export


### Quick Start

Firstly, you have to create a new `Chatbot` instance.
Provide a function that processes a sentence (some form of NLP) and returns an object with `{utterance, intent, score}` properties.

```javascript
const { Chatbot, ChatbotState } = require('convo-platform');

const bot = new Chatbot(yourNlpFunction);
```

Then, you have to define at least one new `ChatbotState`.
Give it a name and add some answers for intents.

```javascript
const firstState = new ChatbotState("state1");

firstState.addAnswer("greeting.hello", "Greetings friend.");
firstState.addAnswer("greeting.hello", "Hello user, how are you?");

firstState.addAnswer("feeling.positive", "That is nice to hear :)");

firstState.addAnswer("feeling.negative", "Sorry to hear that :(");

firstState.addAnswer("greeting.bye", "Goodbye!");
firstState.addAnswer("greeting.bye", "See you later.");
```

You can also add one action per intent (adding multiple actions for same intent will result in previous actions being overwritten).
If you want to add multiple actions, add an anonymous function that calls all of them.
The action will take the current `ChatbotState` as its first and only parameter.

```javascript
firstState.addAction("greeting.hello", initializeSomethingFunction);
firstState.addAction("feeling.positive", (state) => {
	callFirstFunction("do this");
	callSecondFunction("do that");
	callThirdFunction(state);
});
```

After defining your state, don't forget to add it to the `Chatbot` (you can do this immediately after creating the `ChatbotState` as well, since only the reference is passed).

```javascript
bot.addState(firstState);
```

Then, when the bot is set up, you can simply call the `process` function with your sentence to retrieve the result.
This function is asynchronous, so it returns a `Promise`.
The `Promise` resolves into an object with `{utterance, intent, score, answers}` properties.

```javascript
// using Promise syntax
bot.process("Hello bot")
	.then((result) => {
		console.log(`Recognized intent "${result.intent}" from "${result.utterance}" with ${result.score} certainty.`);
		for (let i = 0; i < result.answers.length; i++) {
			console.log(`Bot answer [${i}]: ${result.answers[i]}`);
		}
	})
	.catch(console.error);

// inside async function
(async () => {
	let result = await bot.process("Hello bot");
	console.log(`Recognized intent "${result.intent}" from "${result.utterance}" with ${result.score} certainty.`);
	for (let i = 0; i < result.answers.length; i++) {
		console.log(`Bot answer [${i}]: ${result.answers[i]}`);
	}
})();
```

This should result in all answers for the recognized intent being logged in the console.
Note that the `result.answers` contains all defined answers for the recognized intent.
If only one answer is defined, it is still an array, albeit with only one element.
If no answers are defined for the recognized intent, the `result.answers` array is empty.
