import { GoogleGenerativeAI } from "@google/generative-ai";
import MarkdownIt from 'markdown-it';
import { maybeShowApiKeyBanner } from './gemini-api-banner';
import './style.css';

let API_KEY = 'AIzaSyB-fkv9CQCYw5hhkND6orlbct1o3dpnDAM';

let form = document.querySelector('form');
let promptInput = document.querySelector('input[name="prompt"]');
let chatHistory = document.querySelector('.chat-history');

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const chat = model.startChat({
  history: [],
  generationConfig: {
    maxOutputTokens: 1000
  }
});

form.onsubmit = async (ev) => {
  ev.preventDefault();

  // Get the user prompt and clear the input field
  const userPrompt = promptInput.value;
  promptInput.value = '';

  // Add user prompt to the chat history
  addMessageToHistory(userPrompt, 'user');

  // Retry logic with a maximum number of attempts
  const maxAttempts = 3;
  let attempt = 0;
  let success = false;

  while (attempt < maxAttempts && !success) {
    try {
      attempt++;

      // Create the initial system message for setting the bot's personality
      const systemMessage = 'nama kamu adalah mochi. kata katamu lembut selembut mochi, tapi bahasa kamu sangat santai dan tidak baku. kamu menanyakan nama user. kamu kenal dengan programmer mu yaitu Hanifan Mutashim billah, kamu dan teman temannya memanggilnya hans, kamu tau dia sedang badmood, jadi harap memaafkan dia.';

      const result = await chat.sendMessageStream(systemMessage + "\nUser: " + userPrompt);

      let buffer = [];
      let md = new MarkdownIt();
      for await (let response of result.stream) {
        buffer.push(response.text());
      }
      const botResponse = buffer.join('');
      updateBotResponse(md.render(botResponse));
      success = true;
    } catch (e) {
      if (attempt >= maxAttempts) {
        addMessageToHistory('An error occurred: ' + e.message, 'error');
      }
    }
  }
};

// Function to add messages to the chat history
function addMessageToHistory(content, type) {
  const message = document.createElement('div');
  message.className = `message ${type}`;
  message.innerHTML = `<div class="message-content">${content}</div>`;
  chatHistory.appendChild(message);
  chatHistory.scrollTop = chatHistory.scrollHeight; // Scroll to the bottom
}

// Function to update bot response in the chat history
function updateBotResponse(content) {
  addMessageToHistory(content, 'bot');
}

// You can delete this once you've filled out an API key
maybeShowApiKeyBanner(API_KEY);
