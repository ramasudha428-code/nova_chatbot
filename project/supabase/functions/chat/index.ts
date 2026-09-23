import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ChatRequest {
  message: string;
  conversationId?: string;
  history?: { role: string; content: string }[];
}

// ─────────────────────────────────────────────────────────────────────────────
// KNOWLEDGE BASE — real answers for common questions
// ─────────────────────────────────────────────────────────────────────────────

interface KnowledgeEntry {
  keywords: string[];
  answer: string;
  followUp?: string;
  related?: string[];
}

const knowledgeBase: KnowledgeEntry[] = [
  // ── Programming Languages ──────────────────────────────────────────────────
  {
    keywords: ["python"],
    answer: `**Python** is a high-level, general-purpose programming language created by Guido van Rossum in 1991. It's known for its clean, readable syntax that almost looks like plain English, making it one of the easiest languages to learn.

**Key characteristics:**
- **Interpreted** — runs code line-by-line without needing to compile first
- **Dynamically typed** — no need to declare variable types
- **Cross-platform** — runs on Windows, macOS, Linux, and more
- **Multi-paradigm** — supports object-oriented, procedural, and functional programming

**What it's used for:**
- Web development (Django, Flask)
- Data science & machine learning (pandas, NumPy, TensorFlow)
- Automation and scripting
- Scientific computing
- Artificial intelligence
- Game development (Pygame)

**Fun fact:** Python was named after the comedy group "Monty Python," not the snake!

**Example code:**
\`\`\`python
name = input("What's your name? ")
print(f"Hello, {name}! Welcome to Python.")
\`\`\``,
    followUp: "Would you like to see more Python examples or learn about a specific Python library?",
    related: ["javascript", "java", "typescript"],
  },
  {
    keywords: ["javascript", "js"],
    answer: `**JavaScript** is a lightweight, interpreted programming language that runs in web browsers and servers. Created by Brendan Eich in 1995 in just 10 days, it's now one of the most popular programming languages in the world.

**Key characteristics:**
- **Runs everywhere** — browsers, servers (Node.js), mobile apps, desktop apps
- **Dynamically typed** — variables can hold any type of value
- **Event-driven** — designed to respond to user actions and events
- **Prototype-based** — uses prototypes instead of classes (though ES6 added class syntax)

**What it's used for:**
- Interactive web pages and web apps
- Server-side development (Node.js)
- Mobile apps (React Native)
- Desktop apps (Electron)
- Game development
- Browser extensions

**Example code:**
\`\`\`javascript
const greet = (name) => \`Hello, \${name}!\`;
console.log(greet("World"));
\`\`\``,
    followUp: "Want to learn about frameworks like React or Node.js?",
    related: ["typescript", "python", "react"],
  },
  {
    keywords: ["java "],
    answer: `**Java** is a class-based, object-oriented programming language developed by Sun Microsystems (now owned by Oracle) and released in 1995. Its famous motto is "Write Once, Run Anywhere."

**Key characteristics:**
- **Compiled to bytecode** — runs on the Java Virtual Machine (JVM), making it platform-independent
- **Strongly typed** — strict type checking at compile time
- **Object-oriented** — everything is organized into classes and objects
- **Automatic memory management** — garbage collector handles memory cleanup
- **Multithreaded** — built-in support for concurrent programming

**What it's used for:**
- Enterprise applications (banks, insurance, large-scale systems)
- Android app development
- Web servers and backend services
- Big data processing (Hadoop, Spark)
- Scientific applications

**Example code:**
\`\`\`java
public class Hello {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
\`\`\``,
    followUp: "Would you like to compare Java with another language?",
    related: ["python", "javascript", "c++"],
  },
  {
    keywords: ["typescript", "ts "],
    answer: `**TypeScript** is a strongly-typed superset of JavaScript created by Microsoft in 2012. It adds static type checking to JavaScript, catching errors before your code even runs.

**Key characteristics:**
- **Static typing** — variables, parameters, and return types are checked at compile time
- **Compiles to JavaScript** — the output is plain JS that runs anywhere JS does
- **Better IDE support** — autocompletion, refactoring, and inline documentation
- **Fully compatible** — any valid JavaScript is also valid TypeScript

**What it's used for:**
- Large-scale web applications
- Angular, React, and Vue projects
- Node.js backend services
- Any project where type safety matters

**Example code:**
\`\`\`typescript
interface User {
  name: string;
  age: number;
}

const greet = (user: User): string => \`Hi \${user.name}, you are \${user.age}\`;
\`\`\``,
    followUp: "Want to see how TypeScript compares to JavaScript?",
    related: ["javascript", "react", "python"],
  },
  {
    keywords: ["c++", "cpp", "c plus plus"],
    answer: `**C++** is a powerful, general-purpose programming language created by Bjarne Stroustrup in 1985 as an extension of the C language. It gives developers fine-grained control over hardware while supporting high-level abstractions.

**Key characteristics:**
- **Compiled** — directly compiles to machine code for maximum performance
- **Multi-paradigm** — supports procedural, object-oriented, and generic programming
- **Manual memory management** — you control memory allocation and deallocation
- **Extremely fast** — one of the fastest mainstream languages
- **Statically typed** — types are checked at compile time

**What it's used for:**
- Game engines (Unreal Engine, Unity native)
- Operating systems (parts of Windows, macOS, Linux)
- High-performance applications
- Embedded systems and IoT
- Competitive programming
- Browsers (Chrome's V8 engine is C++)

**Example code:**
\`\`\`cpp
#include <iostream>
int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}
\`\`\``,
    followUp: "Would you like to know how C++ compares to other languages?",
    related: ["java", "python", "c#"],
  },
  {
    keywords: ["c#"],
    answer: `**C#** (pronounced "C-Sharp") is a modern, object-oriented programming language developed by Microsoft and released in 2000. It's part of the .NET ecosystem.

**Key characteristics:**
- **Type-safe** — strict type checking prevents many common errors
- **Object-oriented** — fully supports classes, inheritance, and polymorphism
- **Garbage collected** — automatic memory management
- **Cross-platform** — runs on Windows, Linux, and macOS via .NET Core/.NET 5+
- **Rich library ecosystem** — extensive .NET base class library

**What it's used for:**
- Windows desktop applications
- Game development with Unity
- Web applications (ASP.NET)
- Backend APIs and microservices
- Mobile apps (Xamarin/.NET MAUI)

**Example code:**
\`\`\`csharp
Console.WriteLine("Hello, World!");
\`\`\``,
    followUp: "Want to learn about .NET or game development with Unity?",
    related: ["java", "c++", "python"],
  },
  {
    keywords: ["ruby", "rb "],
    answer: `**Ruby** is a dynamic, object-oriented programming language created by Yukihiro Matsumoto in 1995. It was designed with the principle that programming should be fun and natural for humans.

**Key characteristics:**
- **Everything is an object** — even numbers and booleans have methods
- **Dynamic and flexible** — types are determined at runtime
- **Elegant syntax** — designed to be readable and expressive
- **Blocks and closures** — powerful iteration patterns

**What it's used for:**
- Web development (Ruby on Rails framework)
- Prototyping and startups
- Scripting and automation
- DevOps tooling

**Example code:**
\`\`\`ruby
5.times { puts "Hello, World!" }
\`\`\``,
    related: ["python", "javascript"],
  },
  {
    keywords: ["swift"],
    answer: `**Swift** is a modern programming language developed by Apple, introduced in 2014. It replaced Objective-C as the primary language for Apple platform development.

**Key characteristics:**
- **Fast and safe** — designed for performance with safety features built in
- **Type-safe** — catches type errors at compile time
- **Optionals** — explicitly handles missing values
- **Modern syntax** — clean, concise, and expressive

**What it's used for:**
- iOS apps (iPhone, iPad)
- macOS apps
- watchOS apps (Apple Watch)
- tvOS apps (Apple TV)
- Server-side development (Vapor)

**Example code:**
\`\`\`swift
let name = "World"
print("Hello, \\(name)!")
\`\`\``,
    related: ["python", "java", "typescript"],
  },
  {
    keywords: ["go ", "golang"],
    answer: `**Go** (also called Golang) is a statically typed, compiled programming language developed by Google in 2009. It was designed for simplicity, performance, and concurrency.

**Key characteristics:**
- **Simple syntax** — minimal, easy to learn
- **Compiled and fast** — compiles directly to machine code
- **Built-in concurrency** — goroutines and channels make concurrent programming easy
- **Garbage collected** — automatic memory management
- **Strong standard library** — much functionality built in

**What it's used for:**
- Backend services and APIs
- Microservices architecture
- Cloud infrastructure (Docker, Kubernetes are written in Go)
- Command-line tools
- Network programming

**Example code:**
\`\`\`go
package main
import "fmt"
func main() {
    fmt.Println("Hello, World!")
}
\`\`\``,
    related: ["python", "rust", "typescript"],
  },
  {
    keywords: ["rust"],
    answer: `**Rust** is a systems programming language developed by Mozilla and first released in 2010. It's designed for performance and safety, especially safe concurrency and memory safety.

**Key characteristics:**
- **Memory safe without garbage collection** — ownership system prevents memory bugs
- **Zero-cost abstractions** — high-level features with no runtime overhead
- **Fearless concurrency** — compiler prevents data races
- **Fast** — comparable to C/C++ performance
- **Strong type system** — catches bugs at compile time

**What it's used for:**
- Systems programming (operating systems, drivers)
- Web browsers (parts of Firefox)
- Game engines
- WebAssembly
- Command-line tools (ripgrep, fd)
- Blockchain projects

**Example code:**
\`\`\`rust
fn main() {
    println!("Hello, World!");
}
\`\`\``,
    related: ["go", "c++", "python"],
  },
  {
    keywords: ["php"],
    answer: `**PHP** is a server-side scripting language created in 1994 by Rasmus Lerdorf. Despite being one of the older web languages, it still powers nearly 80% of all websites.

**Key characteristics:**
- **Server-side** — runs on the web server, not in the browser
- **Embedded in HTML** — PHP code can be mixed directly with HTML
- **Dynamically typed** — flexible with variable types
- **Easy to deploy** — works with most web hosting services

**What it's used for:**
- Web development (WordPress, Drupal)
- Backend APIs
- Content management systems
- E-commerce platforms (Magento, WooCommerce)

**Example code:**
\`\`\`php
<?php
echo "Hello, World!";
?>
\`\`\``,
    related: ["javascript", "python", "ruby"],
  },

  // ── Web Technologies & Frameworks ──────────────────────────────────────────
  {
    keywords: ["react", "reactjs", "react.js"],
    answer: `**React** is a JavaScript library for building user interfaces, developed by Meta (formerly Facebook) and released in 2013. It's the most popular frontend library in the world.

**Key concepts:**
- **Components** — UI is built from reusable, self-contained pieces
- **JSX** — write HTML-like syntax directly in JavaScript
- **Virtual DOM** — efficiently updates only what changed
- **Hooks** — useState, useEffect, and others for state and side effects
- **One-way data flow** — predictable, easy to debug

**What it's used for:**
- Single-page applications (SPAs)
- Interactive web apps
- Mobile apps (React Native)
- Dashboards and admin panels
- Social media platforms (Instagram, Facebook use React)

**Example code:**
\`\`\`jsx
function App() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
\`\`\``,
    followUp: "Want to learn about React hooks, state management, or React Native?",
    related: ["javascript", "typescript", "vue"],
  },
  {
    keywords: ["vue", "vuejs", "vue.js"],
    answer: `**Vue.js** is a progressive JavaScript framework for building user interfaces, created by Evan You in 2014. It's known for being approachable and flexible.

**Key characteristics:**
- **Progressive** — use as much or as little as you need
- **Template-based** — HTML templates with directives
- **Reactive** — automatic DOM updates when data changes
- **Single-file components** — HTML, CSS, and JS in one file
- **Gentle learning curve** — easy to pick up

**What it's used for:**
- Web applications
- Interactive UIs
- Prototyping
- Large enterprise apps (with Vue ecosystem)

**Example code:**
\`\`\`vue
<template>
  <button @click="count++">{{ count }}</button>
</template>
<script setup>
import { ref } from 'vue'
const count = ref(0)
</script>
\`\`\``,
    related: ["react", "javascript", "angular"],
  },
  {
    keywords: ["angular"],
    answer: `**Angular** is a TypeScript-based web application framework developed by Google. Originally released in 2010 as AngularJS, it was completely rewritten as Angular 2+ in 2016.

**Key characteristics:**
- **Opinionated** — comes with everything built in (routing, forms, HTTP, etc.)
- **TypeScript-native** — designed for TypeScript from the ground up
- **Two-way data binding** — model and view stay in sync automatically
- **Dependency injection** — built-in DI system for managing services
- **Modular architecture** — organize code into modules and components

**What it's used for:**
- Enterprise web applications
- Single-page applications
- Progressive web apps (PWAs)
- Large-scale projects with teams

**Example code:**
\`\`\`typescript
@Component({
  selector: 'app-root',
  template: '<h1>{{ title }}</h1>'
})
export class AppComponent {
  title = 'Hello, Angular!';
}
\`\`\``,
    related: ["react", "vue", "typescript"],
  },
  {
    keywords: ["node", "nodejs", "node.js"],
    answer: `**Node.js** is a JavaScript runtime built on Chrome's V8 engine that lets you run JavaScript outside the browser — on servers, command lines, and more. Created by Ryan Dahl in 2009.

**Key characteristics:**
- **Event-driven** — uses an event loop for non-blocking I/O
- **Single-threaded** — handles many connections with one thread
- **NPM** — the largest package ecosystem in the world
- **Fast** — V8 engine compiles JS to machine code

**What it's used for:**
- REST APIs and GraphQL servers
- Real-time applications (chat, gaming)
- Microservices
- Command-line tools
- Build tools and dev servers (Vite, Webpack)
- Serverless functions

**Example code:**
\`\`\`javascript
const http = require('http');
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello, World!');
}).listen(3000);
\`\`\``,
    related: ["javascript", "react", "express"],
  },
  {
    keywords: ["html"],
    answer: `**HTML** (HyperText Markup Language) is the standard markup language for creating web pages. It's the skeleton of every website on the internet.

**Key characteristics:**
- **Markup, not programming** — uses tags to structure content
- **Declarative** — you describe what the page should look like
- **Universal** — every browser understands HTML
- **Semantic** — modern HTML5 tags describe meaning (header, nav, article, footer)

**Common tags:**
- \`<h1>\` to \`<h6>\` — headings
- \`<p>\` — paragraphs
- \`<a>\` — links
- \`<img>\` — images
- \`<div>\` and \`<span>\` — containers
- \`<form>\`, \`<input>\`, \`<button>\` — interactive elements

**Example code:**
\`\`\`html
<!DOCTYPE html>
<html>
  <body>
    <h1>Hello, World!</h1>
    <p>This is my first web page.</p>
  </body>
</html>
\`\`\``,
    followUp: "Want to learn about CSS to style your HTML, or JavaScript to make it interactive?",
    related: ["css", "javascript", "react"],
  },
  {
    keywords: ["css"],
    answer: `**CSS** (Cascading Style Sheets) is the language used to style and layout web pages. It controls colors, fonts, spacing, positioning, animations, and responsive design.

**Key characteristics:**
- **Selectors** — target HTML elements to style them
- **Cascading** — styles cascade from general to specific
- **Box model** — every element is a box with content, padding, border, and margin
- **Responsive design** — media queries adapt layouts to different screen sizes
- **Animations** — transitions and keyframe animations without JavaScript

**Modern CSS features:**
- **Flexbox** — one-dimensional layouts
- **Grid** — two-dimensional layouts
- **Custom properties (variables)** — reusable values
- **Container queries** — responsive to parent container size

**Example code:**
\`\`\`css
.button {
  background: linear-gradient(135deg, #10b981, #0d9488);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  transition: transform 0.2s;
}
.button:hover {
  transform: scale(1.05);
}
\`\`\``,
    followUp: "Want to learn about Flexbox, Grid, or Tailwind CSS?",
    related: ["html", "javascript", "tailwind"],
  },
  {
    keywords: ["tailwind", "tailwindcss", "tailwind css"],
    answer: `**Tailwind CSS** is a utility-first CSS framework that lets you build custom designs directly in your HTML without writing separate CSS files.

**Key characteristics:**
- **Utility-first** — small, composable classes like \`p-4 text-center bg-blue-500\`
- **No naming components** — no need to invent class names for elements
- **Highly customizable** — configure colors, spacing, fonts in one config file
- **Responsive built-in** — \`md:text-lg\` applies at medium screens and up
- **Tiny in production** — only the classes you use are included in the build
- **Dark mode** — built-in \`dark:\` variant

**Example:**
\`\`\`html
<button class="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all">
  Click me
</button>
\`\`\`

That single line creates a styled, responsive button with hover effects — no separate CSS needed!`,
    followUp: "Want to see more Tailwind patterns or compare it to other CSS frameworks?",
    related: ["css", "react", "html"],
  },
  {
    keywords: ["express", "expressjs", "express.js"],
    answer: `**Express.js** is a minimal and flexible Node.js web application framework. It's the most popular backend framework for Node.js, providing a thin layer of features on top of Node's HTTP module.

**Key characteristics:**
- **Minimal** — doesn't impose structure, you build what you need
- **Middleware-based** — functions run in sequence for each request
- **Routing** — maps URLs to handler functions
- **Templating** — supports server-side rendering engines
- **REST API friendly** — perfect for building APIs

**Example code:**
\`\`\`javascript
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.json({ message: 'Hello, World!' });
});

app.listen(3000);
\`\`\``,
    related: ["node", "javascript", "react"],
  },

  // ── AI & Machine Learning ──────────────────────────────────────────────────
  {
    keywords: ["artificial intelligence", "ai "],
    answer: `**Artificial Intelligence (AI)** is the field of computer science focused on creating systems that can perform tasks typically requiring human intelligence — such as reasoning, learning, perception, language understanding, and decision-making.

**Major subfields:**
- **Machine Learning** — systems that learn from data
- **Deep Learning** — neural networks with many layers
- **Natural Language Processing** — understanding and generating human language
- **Computer Vision** — understanding images and video
- **Robotics** — physical systems that interact with the world

**Real-world applications:**
- Chatbots and virtual assistants (like me!)
- Self-driving cars
- Medical diagnosis
- Recommendation systems (Netflix, Spotify)
- Language translation (Google Translate)
- Image generation (DALL-E, Midjourney)
- Code assistants (GitHub Copilot)

**How it works:** Modern AI systems learn patterns from large amounts of data, then use those patterns to make predictions or generate new content. The more data and compute, the more capable the system.`,
    followUp: "Want to dive deeper into machine learning, neural networks, or a specific AI application?",
    related: ["machine learning", "deep learning", "neural network"],
  },
  {
    keywords: ["machine learning", "ml "],
    answer: `**Machine Learning (ML)** is a subset of AI that enables computers to learn from data without being explicitly programmed. Instead of writing rules, you feed data to algorithms that discover patterns on their own.

**Three main types:**
- **Supervised Learning** — learns from labeled examples (e.g., "these photos are cats, those are dogs")
- **Unsupervised Learning** — finds patterns in unlabeled data (e.g., customer segmentation)
- **Reinforcement Learning** — learns by trial and error with rewards (e.g., game-playing AI)

**Common algorithms:**
- Linear Regression — predict numbers
- Logistic Regression — classify into categories
- Decision Trees & Random Forests — rule-based decisions
- Neural Networks — learn complex patterns
- K-Means — group similar data points
- SVM — find boundaries between categories

**Popular tools:**
- Python: scikit-learn, TensorFlow, PyTorch
- R, Julia for statistical ML
- Cloud platforms: AWS SageMaker, Google AI, Azure ML

**Example use case:** A spam filter that learns which emails are spam by analyzing thousands of labeled examples, then predicts whether new emails are spam or not.`,
    followUp: "Want to learn about a specific ML algorithm or how to get started with ML?",
    related: ["deep learning", "neural network", "artificial intelligence"],
  },
  {
    keywords: ["deep learning", "neural network", "neural networks"],
    answer: `**Deep Learning** is a subset of machine learning that uses artificial neural networks with multiple layers (hence "deep") to learn complex patterns from data.

**What is a neural network?**
A neural network is inspired by the human brain. It consists of:
- **Neurons (nodes)** — basic processing units
- **Layers** — input layer, hidden layers, output layer
- **Weights & biases** — parameters that get adjusted during training
- **Activation functions** — introduce non-linearity (ReLU, sigmoid, etc.)

**How it learns:**
1. Feed data through the network (forward pass)
2. Compare the output to the correct answer (calculate loss)
3. Adjust weights to reduce the error (backpropagation)
4. Repeat thousands/millions of times

**Types of neural networks:**
- **CNNs** — for images (facial recognition, medical imaging)
- **RNNs/LSTMs** — for sequences (language, time series)
- **Transformers** — for language (GPT, BERT — the tech behind ChatGPT!)
- **GANs** — generate new data (deepfakes, art generation)

**Popular frameworks:** TensorFlow, PyTorch, Keras`,
    followUp: "Want to learn about transformers, how ChatGPT works, or how to build a neural network?",
    related: ["machine learning", "artificial intelligence", "transformer"],
  },
  {
    keywords: ["transformer", "gpt", "chatgpt", "llm", "large language model"],
    answer: `**Transformers & Large Language Models (LLMs)** are the breakthrough technology behind modern AI chatbots like ChatGPT.

**What is a Transformer?**
Introduced in the 2017 paper "Attention Is All You Need," the Transformer architecture revolutionized AI by using a mechanism called **self-attention** — the ability to weigh the importance of different words in a sentence, no matter how far apart they are.

**What is an LLM?**
A Large Language Model is a neural network trained on massive amounts of text data to understand and generate human language. Examples include GPT-4, Claude, Gemini, and Llama.

**How they work:**
- **Training** — the model reads billions of words and learns to predict the next word in a sequence
- **Fine-tuning** — the model is refined to follow instructions and be helpful
- **Inference** — given a prompt, the model generates a response one word at a time

**Key concepts:**
- **Tokens** — text is broken into chunks (words or sub-words)
- **Context window** — how much text the model can "remember" at once
- **Parameters** — the model's internal weights (billions for modern LLMs)
- **Emergent abilities** — at sufficient scale, models develop unexpected capabilities

**Fun fact:** GPT-4 has an estimated 1.7 trillion parameters — that's 1,700,000,000,000 internal weights!`,
    followUp: "Want to know more about how AI models are trained or how to use them in your apps?",
    related: ["deep learning", "machine learning", "artificial intelligence"],
  },

  // ── Computer Science Concepts ──────────────────────────────────────────────
  {
    keywords: ["api"],
    answer: `**API** (Application Programming Interface) is a set of rules that allows different software applications to communicate with each other. Think of it as a waiter at a restaurant — you (the app) tell the waiter (API) what you want, and they bring it back from the kitchen (the server).

**Types of APIs:**
- **REST APIs** — the most common type, uses HTTP methods (GET, POST, PUT, DELETE)
- **GraphQL** — query exactly the data you need, nothing more
- **WebSocket APIs** — real-time bidirectional communication
- **gRPC** — high-performance, uses protocol buffers
- **SOAP** — older, XML-based protocol

**REST API example:**
- \`GET /users\` — fetch all users
- \`GET /users/123\` — fetch user with ID 123
- \`POST /users\` — create a new user
- \`PUT /users/123\` — update user 123
- \`DELETE /users/123\` — delete user 123

**Response format:** Most modern APIs return **JSON** (JavaScript Object Notation):
\`\`\`json
{
  "id": 123,
  "name": "Alice",
  "email": "alice@example.com"
}
\`\`\`

**APIs are everywhere:** weather apps, payment processing (Stripe), maps (Google Maps), social media (Twitter API), and AI services all use APIs.`,
    followUp: "Want to learn how to build your own API or consume an external API?",
    related: ["rest", "json", "http"],
  },
  {
    keywords: ["database", "sql", "postgres", "postgresql", "mysql"],
    answer: `**Database** is an organized collection of structured data stored electronically. Databases are the backbone of nearly every application — they store user accounts, posts, orders, messages, and more.

**Two main types:**
- **SQL (Relational)** — data in tables with rows and columns (PostgreSQL, MySQL, SQLite, SQL Server)
- **NoSQL (Non-relational)** — flexible data models (MongoDB, Redis, DynamoDB, Cassandra)

**SQL basics:**
\`\`\`sql
-- Create a table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(200) UNIQUE
);

-- Insert data
INSERT INTO users (name, email) VALUES ('Alice', 'alice@example.com');

-- Query data
SELECT * FROM users WHERE name = 'Alice';

-- Update data
UPDATE users SET name = 'Bob' WHERE id = 1;

-- Delete data
DELETE FROM users WHERE id = 1;
\`\`\`

**PostgreSQL** specifically is a powerful, open-source relational database known for its reliability, advanced features (JSON support, full-text search, geospatial data), and standards compliance. It's used by major companies like Apple, Instagram, and Spotify.`,
    followUp: "Want to learn more SQL queries, database design, or about a specific database?",
    related: ["sql", "supabase", "api"],
  },
  {
    keywords: ["supabase"],
    answer: `**Supabase** is an open-source backend-as-a-service platform that provides everything you need to build a web or mobile app without managing servers.

**What it includes:**
- **PostgreSQL Database** — full Postgres database with real-time capabilities
- **Authentication** — email/password, social login, magic links
- **Storage** — file and image storage with CDN
- **Edge Functions** — serverless functions (Deno-based)
- **Realtime** — live updates via WebSocket subscriptions
- **Row Level Security** — database-level access control

**Why developers love it:**
- No vendor lock-in (uses open-source Postgres)
- Direct database access from the frontend (with RLS for security)
- Generous free tier
- Auto-generated REST and GraphQL APIs from your database schema
- Real-time subscriptions out of the box

**How it compares:** Supabase is often described as the open-source alternative to Firebase — but while Firebase uses a NoSQL document store, Supabase uses a real PostgreSQL database with all its relational power.`,
    followUp: "Want to learn about RLS policies, edge functions, or building an app with Supabase?",
    related: ["database", "postgres", "api"],
  },
  {
    keywords: ["git ", "github", "version control"],
    answer: `**Git** is a distributed version control system that tracks changes in your code. **GitHub** is a web platform that hosts Git repositories and adds collaboration features.

**Git key concepts:**
- **Repository (repo)** — a project folder tracked by Git
- **Commit** — a snapshot of your code at a point in time
- **Branch** — a separate line of development
- **Merge** — combine changes from different branches
- **Clone** — copy a repo to your computer
- **Push/Pull** — sync changes with a remote repo

**Essential commands:**
\`\`\`bash
git init              # Start tracking a new project
git add .             # Stage all changes
git commit -m "msg"   # Save a snapshot
git push origin main  # Upload to GitHub
git pull              # Download latest changes
git branch feature    # Create a new branch
git checkout feature  # Switch to that branch
git merge feature     # Merge branch into current branch
\`\`\`

**Why use it:**
- Track every change ever made to your code
- Collaborate with others without conflicts
- Roll back to any previous version
- Review code changes before merging (pull requests)`,
    followUp: "Want to learn about branching strategies, pull requests, or Git workflows?",
    related: ["github", "command line", "coding"],
  },
  {
    keywords: ["docker", "container", "containerization"],
    answer: `**Docker** is a platform that packages applications and their dependencies into standardized units called **containers** — ensuring they run the same way everywhere.

**The problem it solves:** "It works on my machine!" — Docker makes sure your app runs identically on your laptop, your coworker's laptop, staging, and production.

**Key concepts:**
- **Container** — a lightweight, standalone package with everything an app needs to run
- **Image** — a read-only template for creating containers (like a blueprint)
- **Dockerfile** — a text file with instructions to build an image
- **Docker Hub** — public registry of pre-built images
- **Docker Compose** — run multiple containers together

**Example Dockerfile:**
\`\`\`dockerfile
FROM node:18
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
CMD ["node", "server.js"]
\`\`\`

**Common commands:**
\`\`\`bash
docker build -t myapp .     # Build an image
docker run -p 3000:3000 myapp  # Run a container
docker ps                   # List running containers
docker stop <id>            # Stop a container
\`\`\`

Docker is written in Go and is the foundation of modern container orchestration (Kubernetes).`,
    related: ["kubernetes", "go", "devops"],
  },
  {
    keywords: ["kubernetes", "k8s"],
    answer: `**Kubernetes** (often abbreviated K8s) is an open-source container orchestration platform originally developed by Google. It manages, scales, and deploys containerized applications across clusters of machines.

**What it does:**
- **Auto-scaling** — automatically adds or removes containers based on load
- **Self-healing** — restarts failed containers, replaces dead ones
- **Load balancing** — distributes traffic across multiple containers
- **Rolling updates** — deploy new versions with zero downtime
- **Service discovery** — containers find each other automatically

**Key concepts:**
- **Pod** — smallest unit, contains one or more containers
- **Deployment** — manages a set of pods and their updates
- **Service** — network endpoint for accessing pods
- **Cluster** — a group of machines running Kubernetes
- **Node** — a single machine in the cluster

**Analogy:** If Docker is like shipping containers, Kubernetes is the port that manages where all the containers go, how many there are, and what happens when one falls off the ship.`,
    related: ["docker", "go", "cloud computing"],
  },

  // ── Cloud & DevOps ─────────────────────────────────────────────────────────
  {
    keywords: ["cloud computing", "aws", "azure", "google cloud", "gcp"],
    answer: `**Cloud Computing** is the delivery of computing services — servers, storage, databases, networking, software, and analytics — over the internet ("the cloud"). Instead of buying and maintaining physical servers, you rent access from a cloud provider.

**Service models:**
- **IaaS** (Infrastructure as a Service) — virtual machines, networks (AWS EC2, Azure VMs)
- **PaaS** (Platform as a Service) — managed platforms for building apps (Heroku, Google App Engine)
- **SaaS** (Software as a Service) — ready-to-use software (Gmail, Slack, Notion)
- **FaaS** (Functions as a Service) — serverless functions (AWS Lambda, Cloud Functions)

**Major cloud providers:**
- **AWS** (Amazon Web Services) — market leader, widest range of services
- **Microsoft Azure** — strong enterprise integration, popular for .NET shops
- **Google Cloud Platform (GCP)** — strong in AI/ML and data analytics
- Others: DigitalOcean, Linode, Oracle Cloud, IBM Cloud

**Deployment models:**
- **Public cloud** — shared infrastructure (AWS, Azure, GCP)
- **Private cloud** — dedicated to one organization
- **Hybrid cloud** — mix of public and private
- **Multi-cloud** — use multiple providers

**Benefits:** Pay only for what you use, scale up or down instantly, no upfront hardware costs, global reach, managed security and compliance.`,
    followUp: "Want to learn about a specific cloud provider or service?",
    related: ["docker", "kubernetes", "serverless"],
  },
  {
    keywords: ["serverless", "lambda", "edge function", "edge functions"],
    answer: `**Serverless computing** is a cloud execution model where the cloud provider manages the infrastructure entirely — you just write the code and the provider handles scaling, routing, and server management.

**How it works:**
1. You write a function (a small piece of code)
2. Upload it to the cloud provider
3. The provider runs it only when triggered (an HTTP request, a database change, a timer)
4. You pay only for the actual execution time

**Key characteristics:**
- **No server management** — you never see or manage servers
- **Auto-scaling** — scales from 0 to thousands of instances automatically
- **Pay-per-use** — only pay when your code runs
- **Event-driven** — triggered by events (HTTP, database changes, queues, timers)

**Popular serverless platforms:**
- **AWS Lambda** — the original serverless platform
- **Google Cloud Functions**
- **Azure Functions**
- **Supabase Edge Functions** — Deno-based, run at the edge
- **Cloudflare Workers** — run in 300+ locations globally
- **Vercel Functions** — integrated with Next.js

**Best for:** APIs, webhooks, data processing, scheduled tasks, real-time features
**Not ideal for:** Long-running tasks, stateful applications, heavy computations`,
    related: ["cloud computing", "api", "supabase"],
  },

  // ── Blockchain & Crypto ────────────────────────────────────────────────────
  {
    keywords: ["blockchain", "bitcoin", "cryptocurrency", "crypto", "ethereum"],
    answer: `**Blockchain** is a distributed, immutable ledger technology where data is stored in blocks that are cryptographically linked together in a chain. Once data is recorded, it's nearly impossible to change — making blockchain extremely secure and transparent.

**How it works:**
1. A transaction is requested
2. The transaction is broadcast to a network of computers (nodes)
3. Nodes validate the transaction using consensus algorithms (Proof of Work, Proof of Stake)
4. Validated transactions are grouped into a block
5. The block is linked to the previous block using a cryptographic hash
6. The transaction is complete and permanent

**Key characteristics:**
- **Decentralized** — no single party controls it
- **Immutable** — once written, data can't be altered
- **Transparent** — all transactions are publicly visible
- **Trustless** — no need to trust a third party

**Cryptocurrencies:**
- **Bitcoin** — the first blockchain (2009, created by Satoshi Nakamoto), digital store of value
- **Ethereum** — blockchain with smart contracts (created by Vitalik Buterin)
- **Solana, Cardano, Polygon** — newer blockchains with faster speeds

**Beyond crypto — applications:**
- Supply chain tracking
- Voting systems
- Smart contracts (self-executing agreements)
- NFTs (digital ownership)
- Decentralized finance (DeFi)
- Identity verification`,
    followUp: "Want to learn about smart contracts, a specific cryptocurrency, or Web3 development?",
    related: ["solidity", "web3", "cryptography"],
  },

  // ── Science & General Knowledge ────────────────────────────────────────────
  {
    keywords: ["quantum computing", "quantum computer"],
    answer: `**Quantum Computing** is a revolutionary computing paradigm that uses quantum-mechanical phenomena to process information in ways classical computers cannot.

**Classical vs Quantum:**
- Classical computers use **bits** — each bit is either 0 or 1
- Quantum computers use **qubits** — a qubit can be 0, 1, or **both simultaneously** (superposition)

**Key quantum concepts:**
- **Superposition** — a qubit exists in multiple states at once
- **Entanglement** — qubits can be connected so that changing one instantly affects another, even at a distance
- **Interference** — quantum algorithms amplify correct answers and cancel wrong ones
- **Decoherence** — the challenge of keeping qubits stable (why quantum computers are so hard to build)

**What quantum computers could do:**
- Break current encryption (Shor's algorithm)
- Simulate molecules for drug discovery
- Optimize complex logistics and financial portfolios
- Accelerate AI training
- Solve problems that would take classical computers millions of years

**Current state (2026):** Companies like IBM, Google, and IonQ have built quantum computers with hundreds of qubits, but they're still experimental and error-prone. We're in the **NISQ era** (Noisy Intermediate-Scale Quantum) — useful for research, but not yet for everyday problems.`,
    followUp: "Want to learn about a specific quantum algorithm or how quantum computers are built?",
    related: ["cryptography", "machine learning", "physics"],
  },
  {
    keywords: ["climate change", "global warming", "greenhouse"],
    answer: `**Climate Change** refers to long-term shifts in global temperatures and weather patterns. While climate change has occurred naturally throughout Earth's history, the current period of change is primarily driven by human activities.

**Primary causes:**
- **Burning fossil fuels** (coal, oil, gas) releases CO2 — the biggest contributor
- **Deforestation** — trees absorb CO2; cutting them down releases it
- **Agriculture** — methane from livestock and rice paddies
- **Industrial processes** — cement, steel, chemical production

**Key facts:**
- Global average temperature has risen about 1.1°C since pre-industrial times
- The Paris Agreement aims to limit warming to 1.5°C
- CO2 levels are at their highest in at least 2 million years
- 2023 was the hottest year on record

**Impacts:**
- More frequent and intense extreme weather (hurricanes, droughts, heatwaves, floods)
- Rising sea levels (melting ice sheets + thermal expansion)
- Ecosystem disruption and species extinction
- Food and water insecurity
- Climate migration

**Solutions:**
- Transition to renewable energy (solar, wind, hydro)
- Electrify transportation (EVs)
- Carbon capture and storage
- Reforestation and ecosystem restoration
- Energy efficiency
- Policy: carbon pricing, emissions standards`,
    followUp: "Want to learn about renewable energy, carbon capture, or what you can do to help?",
    related: ["renewable energy", "sustainability", "environment"],
  },
  {
    keywords: ["renewable energy", "solar energy", "wind energy", "clean energy"],
    answer: `**Renewable Energy** is energy from sources that naturally replenish themselves and never run out — unlike fossil fuels which take millions of years to form and are finite.

**Main types of renewable energy:**

1. **Solar** — converts sunlight into electricity using photovoltaic panels
   - Fastest-growing energy source globally
   - Can be rooftop (residential) or utility-scale (solar farms)
   - Cost has dropped 90% in the last decade

2. **Wind** — uses turbines to convert wind into electricity
   - Onshore and offshore wind farms
   - Offshore wind is more consistent and powerful
   - One modern turbine can power ~1,000 homes

3. **Hydroelectric** — uses flowing water to spin turbines
   - Largest source of renewable electricity globally
   - Dams (large-scale) and run-of-river (small-scale)

4. **Geothermal** — uses heat from Earth's interior
   - Most reliable (runs 24/7, not weather-dependent)
   - Common in Iceland, California, New Zealand

5. **Biomass** — burns organic matter (wood, agricultural waste)
   - Controversial — still produces CO2

**Why renewables matter:**
- No greenhouse gas emissions during operation
- Infinite fuel source (sun, wind, water)
- Creates jobs and energy independence
- Increasingly cheaper than fossil fuels

**The main challenge:** Intermittency — the sun doesn't always shine and the wind doesn't always blow. Solutions include battery storage, pumped hydro, and grid interconnection.`,
    followUp: "Want to learn about a specific renewable technology or energy storage?",
    related: ["climate change", "battery", "sustainability"],
  },
  {
    keywords: ["photosynthesis"],
    answer: `**Photosynthesis** is the process by which plants, algae, and some bacteria convert sunlight, water, and carbon dioxide into oxygen and glucose (sugar). It's one of the most important biological processes on Earth — without it, there would be no oxygen to breathe and no food chain.

**The equation:**
\`\`\`
6CO2 + 6H2O + Light Energy → C6H12O6 + 6O2
(Carbon Dioxide + Water + Sunlight → Glucose + Oxygen)
\`\`\`

**How it works (step by step):**
1. **Light absorption** — chlorophyll (green pigment) in leaves absorbs sunlight
2. **Water splitting** — the energy splits water molecules into hydrogen and oxygen
3. **CO2 fixation** — the hydrogen combines with CO2 to form glucose
4. **Oxygen release** — oxygen is released as a byproduct (which we breathe!)

**Where it happens:** Inside **chloroplasts**, specifically in the **thylakoid membranes** (light reactions) and the **stroma** (Calvin cycle / dark reactions).

**Two stages:**
- **Light-dependent reactions** — capture energy from sunlight (produces ATP and NADPH)
- **Calvin cycle (light-independent)** — uses that energy to build glucose from CO2

**Why it matters:**
- Produces the oxygen we breathe
- Forms the base of nearly all food chains
- Removes CO2 from the atmosphere
- The energy in fossil fuels originally came from ancient photosynthesis!`,
    followUp: "Want to learn about plant biology, cellular respiration, or ecosystems?",
    related: ["biology", "plants", "cellular respiration"],
  },
  {
    keywords: ["dna", "genetics", "genome", "gene "],
    answer: `**DNA** (Deoxyribonucleic Acid) is the molecule that carries the genetic instructions for all living organisms. It's essentially the blueprint of life — it tells your cells what to do and what to build.

**Structure:**
- **Double helix** — two strands twisted around each other (discovered by Watson & Crick in 1953)
- **Nucleotides** — each strand is made of four building blocks: Adenine (A), Thymine (T), Guanine (G), Cytosine (C)
- **Base pairing** — A always pairs with T, G always pairs with C
- **Backbone** — sugar (deoxyribose) and phosphate

**Key concepts:**
- **Gene** — a section of DNA that codes for a specific protein
- **Genome** — the complete set of DNA in an organism (humans have ~20,000 genes)
- **Chromosome** — DNA is packaged into chromosomes (humans have 23 pairs)
- **Protein synthesis** — DNA → RNA → Protein (the "central dogma" of biology)

**Fun facts:**
- If you stretched out all the DNA in your body, it would reach the sun and back ~60 times
- You share 99.9% of your DNA with every other human
- You share about 60% of your DNA with a banana
- The Human Genome Project (completed 2003) sequenced all 3 billion base pairs of human DNA

**Modern applications:**
- Genetic testing (ancestry, health risks)
- CRISPR gene editing
- Personalized medicine
- Agricultural engineering`,
    followUp: "Want to learn about CRISPR, genetic diseases, or how DNA testing works?",
    related: ["biology", "crispr", "evolution"],
  },
  {
    keywords: ["space", "universe", "galaxy", "black hole", "astronomy"],
    answer: `**Space** is the vast, mostly empty expanse that exists beyond Earth's atmosphere. The **Universe** contains everything that exists — all matter, energy, stars, planets, galaxies, and even space itself.

**Mind-blowing scale:**
- The observable universe is about **93 billion light-years** across
- There are an estimated **2 trillion galaxies** in the observable universe
- Each galaxy contains **100-400 billion stars**
- The universe is **13.8 billion years old** (started with the Big Bang)

**Key cosmic objects:**
- **Stars** — giant balls of hot gas that fuse hydrogen into helium (our Sun is a medium-sized star)
- **Planets** — orbit stars; our solar system has 8 planets
- **Galaxies** — massive collections of stars, gas, and dust (our Milky Way has ~200 billion stars)
- **Black holes** — regions where gravity is so strong that nothing, not even light, can escape
- **Nebulae** — clouds of gas and dust where new stars are born
- **Dark matter & dark energy** — make up ~95% of the universe, but we can't see them

**What is a black hole?**
A black hole forms when a massive star collapses at the end of its life. Its gravity is so intense that it warps space and time. The boundary beyond which nothing can escape is called the **event horizon**. The first image of a black hole was captured in 2019.

**Are we alone?** We haven't found life elsewhere yet, but scientists are searching with telescopes like JWST and missions to Mars, Europa (Jupiter's moon), and Enceladus (Saturn's moon).`,
    followUp: "Want to explore a specific cosmic topic — black holes, the Big Bang, exoplanets, or space exploration?",
    related: ["physics", "big bang", "mars"],
  },
  {
    keywords: ["internet", "how does the internet work", "tcp/ip", "http"],
    answer: `**The Internet** is a global network of interconnected computers that communicate using standardized protocols. It's the infrastructure that makes the web, email, messaging, streaming, and everything else online possible.

**How it works (simplified):**
1. Your device connects to a **router** (via WiFi or cable)
2. The router connects to your **ISP** (Internet Service Provider — Comcast, AT&T, etc.)
3. Your ISP connects to larger **backbone networks** via fiber optic cables
4. Data travels through these networks to reach its destination server
5. The server sends a response back through the same path

**Key protocols:**
- **TCP/IP** — the fundamental communication protocol (how data is addressed and transmitted)
- **HTTP/HTTPS** — protocol for loading websites (HTTPS adds encryption)
- **DNS** — the "phone book" of the internet (translates domain names like google.com to IP addresses)
- **SSL/TLS** — encryption that secures your connection (the lock icon in your browser)

**Data packets:** When you load a webpage, the data is broken into thousands of small **packets**. Each packet finds its own route to the destination, then gets reassembled. This makes the internet resilient — if one path fails, packets take another.

**Fun facts:**
- The internet started as ARPANET in 1969 (US military research)
- The World Wide Web was invented by Tim Berners-Lee in 1989
- There are over 5 billion internet users worldwide (as of 2025)
- Undersea cables spanning oceans carry 99% of intercontinental data
- A single Google search uses more computing power than the Apollo moon landing!`,
    followUp: "Want to learn about web development, networking, or internet security?",
    related: ["api", "http", "dns", "web development"],
  },
  {
    keywords: ["linux", "ubuntu", "operating system", "os "],
    answer: `**Linux** is a free, open-source operating system kernel created by Linus Torvalds in 1991. It powers most of the internet's servers, all Android phones, smart TVs, cars, and even the International Space Station.

**What is an operating system?**
An OS is software that manages hardware and software resources — it's the layer between your apps and your hardware. Windows, macOS, and Linux are all operating systems.

**Linux distributions (distros):**
- **Ubuntu** — beginner-friendly, popular for desktops and servers
- **Debian** — stable, the foundation for Ubuntu
- **Fedora** — cutting-edge, backed by Red Hat
- **Arch Linux** — for advanced users who want full control
- **CentOS/RHEL** — enterprise servers
- **Android** — yes, Android is Linux-based!

**Why Linux is everywhere:**
- **Free and open-source** — anyone can use and modify it
- **Stable and reliable** — servers run for years without rebooting
- **Secure** — fewer viruses than Windows
- **Lightweight** — can run on old hardware, Raspberry Pi, embedded devices
- **Customizable** — you control everything

**Essential Linux commands:**
\`\`\`bash
ls          # List files
cd /path    # Change directory
mkdir name  # Create a directory
rm file     # Delete a file
cat file    # View file contents
grep "word" file  # Search in a file
sudo apt install package  # Install software (Ubuntu)
\`\`\``,
    followUp: "Want to learn Linux commands, shell scripting, or set up a Linux server?",
    related: ["command line", "git", "server"],
  },

  // ── Business & Productivity ────────────────────────────────────────────────
  {
    keywords: ["startup", "entrepreneur", "business"],
    answer: `**Startup** is a young company built to grow fast and solve a problem in a new way. Startups typically operate in conditions of extreme uncertainty, aiming to find a repeatable, scalable business model.

**Key stages:**
1. **Idea stage** — identify a real problem worth solving
2. **Validation** — talk to customers, build an MVP (Minimum Viable Product)
3. **Early traction** — get your first paying customers
4. **Growth** — scale what works
5. **Scale/maturity** — expand into new markets, products

**How to start:**
- **Find a real problem** — not a solution looking for a problem. Talk to potential customers before writing code.
- **Build an MVP** — the simplest version that solves the core problem. Ship fast, learn fast.
- **Validate demand** — are people willing to pay? Free users ≠ customers.
- **Focus on one thing** — resist doing everything. Nail one use case first.
- **Talk to users constantly** — the best founders talk to customers every single day.

**Funding options:**
- **Bootstrapping** — fund yourself, keep 100% equity
- **Friends & family** — early small investments
- **Angel investors** — individuals investing their own money ($25K-$500K)
- **Venture capital (VC)** — firms investing pooled money ($1M+)
- **Crowdfunding** — Kickstarter, Indiegogo
- **Grants and competitions** — non-dilutive funding

**Key metrics:**
- **CAC** (Customer Acquisition Cost) — how much it costs to get one customer
- **LTV** (Lifetime Value) — how much a customer is worth over time
- **MRR** (Monthly Recurring Revenue) — predictable monthly income
- **Burn rate** — how fast you're spending money
- **Runway** — how many months until you run out of cash

**Common mistakes:**
- Building before talking to users
- Trying to raise money too early
- Hiring too fast
- Not focusing on sales
- Failing to pivot when the data says you should`,
    followUp: "Want to dive into a specific stage — finding an idea, building an MVP, or raising funding?",
    related: ["product", "marketing", "funding"],
  },

  // ── Health & Wellness ──────────────────────────────────────────────────────
  {
    keywords: ["sleep", "insomnia", "rest"],
    answer: `**Sleep** is a natural, recurring state of rest that's essential for physical health, mental clarity, and emotional well-being. Your brain and body are remarkably active during sleep — repairing tissue, consolidating memories, and regulating hormones.

**Sleep stages (90-minute cycles):**
1. **Light sleep (N1, N2)** — transition and light rest; heart rate slows
2. **Deep sleep (N3)** — physical restoration; tissue repair, immune strengthening
3. **REM sleep** — vivid dreaming; memory consolidation, emotional processing
A good night has 4-6 complete cycles.

**How much you need:**
- Adults: 7-9 hours
- Teens: 8-10 hours
- Children: 9-13 hours
- Babies: 12-17 hours

**Tips for better sleep:**
- Keep a consistent schedule (same bedtime even on weekends)
- Avoid screens 1 hour before bed (blue light suppresses melatonin)
- Keep the room cool (65-68°F / 18-20°C is ideal)
- Avoid caffeine after 2 PM (its half-life is 5-6 hours)
- Get sunlight exposure in the morning (sets your circadian rhythm)
- Exercise regularly (but not right before bed)
- Avoid large meals 2-3 hours before sleep

**What happens when you don't sleep enough:**
- Impaired memory and concentration
- Weakened immune system
- Increased risk of heart disease, diabetes, obesity
- Mood swings and irritability
- Reduced reaction time (dangerous for driving)
- Chronic sleep deprivation is linked to Alzheimer's

**Fun fact:** Humans are the only mammals that willingly delay sleep!`,
    followUp: "Want tips on building a sleep routine or understanding a specific sleep issue?",
    related: ["health", "exercise", "nutrition"],
  },
  {
    keywords: ["exercise", "workout", "fitness", "gym"],
    answer: `**Exercise** is physical activity that improves or maintains physical fitness and overall health. It's one of the most powerful things you can do for your body and mind.

**Types of exercise:**
1. **Aerobic (cardio)** — running, swimming, cycling, dancing; improves heart and lung health
2. **Strength training** — weights, resistance bands, bodyweight; builds muscle and bone density
3. **Flexibility** — stretching, yoga, Pilates; improves range of motion and prevents injury
4. **Balance** — tai chi, stability exercises; important as you age

**How much you need (WHO guidelines):**
- **Adults:** 150-300 minutes of moderate cardio per week, OR 75-150 minutes of vigorous cardio
- Plus **strength training** 2+ times per week (all major muscle groups)
- **Children:** 60 minutes daily

**Benefits:**
- Reduces risk of heart disease, stroke, type 2 diabetes, and some cancers
- Strengthens bones and muscles
- Improves mental health (reduces anxiety and depression)
- Boosts energy and sleep quality
- Improves cognitive function and memory
- Increases lifespan and healthspan
- Reduces stress

**Getting started (for beginners):**
- Start small — even a 10-minute walk counts
- Find something you enjoy (you won't stick with what you hate)
- Be consistent — 3-4 days per week beats one intense session
- Mix it up — combine cardio and strength
- Track progress — but focus on how you feel, not just the scale
- Rest matters — muscles grow during recovery, not during the workout

**Key principle:** Progressive overload — gradually increase intensity, duration, or weight over time. That's how your body keeps adapting and improving.`,
    followUp: "Want a specific workout plan or tips on a particular type of exercise?",
    related: ["health", "nutrition", "sleep"],
  },
  {
    keywords: ["nutrition", "diet", "healthy eating", "food"],
    answer: `**Nutrition** is the science of how food affects the body. What you eat directly impacts your energy, health, mood, and longevity. Good nutrition isn't about strict diets — it's about consistently choosing foods that nourish your body.

**The essential nutrients:**

**Macronutrients (needed in large amounts):**
- **Protein** — builds and repairs tissue (meat, fish, eggs, beans, nuts, tofu)
- **Carbohydrates** — primary energy source (whole grains, fruits, vegetables)
- **Fats** — hormone production, brain health, nutrient absorption (avocado, olive oil, nuts, fish)

**Micronutrients (needed in small amounts):**
- **Vitamins** — A, B-complex, C, D, E, K (from fruits, vegetables, whole foods)
- **Minerals** — calcium, iron, magnesium, zinc, potassium (from varied whole foods)

**Simple principles for healthy eating:**
1. **Eat mostly whole foods** — foods close to their natural state (vegetables, fruits, whole grains, lean proteins)
2. **Eat the rainbow** — different colored vegetables and fruits provide different nutrients
3. **Prioritize protein** — aim for 0.7-1g per pound of body weight for active people
4. **Choose healthy fats** — olive oil, avocados, nuts, fatty fish over processed fats
5. **Limit ultra-processed foods** — packaged snacks, sugary drinks, fast food
6. **Stay hydrated** — drink water throughout the day (~2-3 liters)
7. **Watch portion sizes** — even healthy foods can cause weight gain in excess

**Popular diets (and their focus):**
- **Mediterranean** — plant-based with fish and olive oil; best evidence for longevity
- **Plant-based/Vegan** — no animal products; good for heart and environment
- **Keto** — very low carb, high fat; effective for weight loss but hard to sustain
- **Intermittent fasting** — eating window (e.g., 16:8); helps with calorie control
- **Paleo** — whole foods, no processed foods or grains

**Important note:** There's no one-size-fits-all diet. The best diet is one you can stick with long-term and that makes you feel energized and healthy. Consult a doctor or registered dietitian for personalized advice.`,
    followUp: "Want to learn about a specific nutrient, meal planning, or a particular diet?",
    related: ["exercise", "health", "sleep"],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE ENGINE
// ─────────────────────────────────────────────────────────────────────────────

async function generateResponse(userMessage: string, history: { role: string; content: string }[]): Promise<string> {
  const msg = userMessage.trim();
  const lower = msg.toLowerCase();

  // Greeting patterns
  if (/^(hi|hello|hey|greetings|howdy|yo|sup|what's up|good (morning|afternoon|evening))\b/.test(lower)) {
    const greetings = [
      "Hello! I'm Nova AI, your personal assistant. I can answer questions, explain concepts, help you brainstorm, and much more. What would you like to know?",
      "Hi there! Great to see you. I'm here to help with anything you're curious about — ask me a question and let's dive in!",
      "Hey! Welcome to Nova AI. Whether you need answers, ideas, or just want to chat, I'm ready. What's on your mind?",
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  // How are you
  if (/how (are|r) (you|u)|how's it going|how do you do/.test(lower)) {
    return "I'm doing great, thank you for asking! I'm always ready and eager to help. As an AI, I don't have feelings in the human sense, but I find it deeply satisfying to assist with interesting questions. How can I help you today?";
  }

  // Who are you / what are you
  if (/who are you|what are you|what can you do|your name|tell me about yourself/.test(lower)) {
    return "I'm **Nova AI**, a smart chatbot assistant designed to answer your questions and help you think through problems. I have a built-in knowledge base covering programming languages, web technologies, AI, science, health, business, and more. I can explain concepts, help you brainstorm, assist with writing, do calculations, and carry on natural conversations. Ask me anything!";
  }

  // Thank you
  if (/^(thanks|thank you|thx|appreciate it|cheers|ty)\b/.test(lower)) {
    return "You're very welcome! I'm glad I could help. Feel free to ask me anything else — I'm always here when you need assistance.";
  }

  // ── Knowledge base lookup ──────────────────────────────────────────────────
  // First try "what is X" / "define X" / "explain X" patterns
  const defineMatch = msg.match(/^(?:what (?:is|are)|define|explain|tell me about|what does|what's)\s+(.+)/i);
  if (defineMatch) {
    const topic = defineMatch[1].replace(/\?+$/, "").replace(/^(a|an|the)\s+/i, "").trim();
    const entry = lookupKnowledge(topic);
    if (entry) {
      return formatAnswer(entry);
    }
    return await generateDefinition(topic);
  }

  // Also check: bare keyword queries (e.g., just "python" or "tell me about python")
  const entry = lookupKnowledge(msg);
  if (entry) {
    return formatAnswer(entry);
  }

  // How do I / how to
  const howToMatch = msg.match(/^(?:how (?:do i|to|can i)|how would i)\s+(.+)/i);
  if (howToMatch) {
    const task = howToMatch[1].replace(/\?+$/, "").trim();
    return `Great question about how to ${task}! Here's a structured approach:\n\n1. **Start by understanding the goal** — Break down what "${task}" means and what a successful outcome looks like.\n2. **Gather the right resources** — Identify the tools, knowledge, or materials you'll need.\n3. **Break it into smaller steps** — Any complex task becomes manageable when divided into clear, sequential steps.\n4. **Execute and iterate** — Start with the first step, evaluate your progress, and adjust as you go.\n5. **Review and refine** — Once complete, look back at what worked well and what could be improved for next time.\n\nWould you like me to go deeper on any specific part of this process?`;
  }

  // Why questions
  const whyMatch = msg.match(/^why\s+(.+)/i);
  if (whyMatch) {
    const subject = whyMatch[1].replace(/\?+$/, "").trim();
    return `That's a thoughtful question about why ${subject}. Understanding the "why" behind things is one of the most powerful ways to learn. Generally, the reasons behind any phenomenon come down to a combination of:\n\n- **Cause and effect** — There's usually a direct relationship between something that happened and the conditions that led to it.\n- **Underlying principles** — Fundamental rules or laws that govern how things work.\n- **Context and circumstances** — The specific situation often shapes the outcome.\n\nTo give you a more specific answer, could you share a bit more context about what aspect of "${subject}" you're most curious about?`;
  }

  // Math evaluation
  const mathMatch = msg.match(/^(?:what(?:'s| is)|calculate|compute|solve)\s+([\d\s+\-*/().^%]+)\??$/i);
  if (mathMatch) {
    const expr = mathMatch[1].trim();
    try {
      const sanitized = expr.replace(/\^/g, "**");
      if (/^[\d\s+\-*/.()%*]+$/.test(sanitized)) {
        const result = Function(`"use strict"; return (${sanitized})`)();
        return `The answer to **${expr}** is **${result}**.\n\nLet me know if you'd like me to work through the steps or tackle another calculation!`;
      }
    } catch {
      // fall through
    }
  }

  // Compare — check if both sides are in knowledge base
  const compareMatch = msg.match(/^(?:compare|difference between|what's the difference between)\s+(.+)/i);
  if (compareMatch) {
    const parts = compareMatch[1].split(/\s+vs\.?\s+|\s+or\s+|\s+versus\s+/i);
    if (parts.length >= 2) {
      const a = parts[0].trim();
      const b = parts.slice(1).join(" ").trim();
      const entryA = lookupKnowledge(a);
      const entryB = lookupKnowledge(b);
      if (entryA && entryB) {
        return `Here's a comparison between **${a}** and **${b}**:\n\n**${a}:**\n${entryA.answer.split("\n").filter((l) => l.trim().startsWith("-") || l.trim().startsWith("**")).slice(0, 4).join("\n")}\n\n**${b}:**\n${entryB.answer.split("\n").filter((l) => l.trim().startsWith("-") || l.trim().startsWith("**")).slice(0, 4).join("\n")}\n\n**Key takeaway:** Both are powerful tools, but they serve different needs. The right choice depends on your specific goals and context.\n\nWould you like me to go deeper on either one?`;
      }
      return `Here's a comparison between **${a}** and **${b}**:\n\n**${a}:**\n- Has its own set of characteristics, advantages, and trade-offs\n- Best suited for specific use cases where its strengths align with the requirements\n\n**${b}:**\n- Offers a different set of features and benefits\n- Excels in scenarios where its particular attributes are most valuable\n\n**Key differences:**\n- Each serves different needs and contexts\n- The right choice depends on your specific goals, constraints, and preferences\n\nWould you like me to dive deeper into a particular aspect of this comparison?`;
    }
  }

  // List / examples
  if (/^(?:list|give me|what are some|examples of|name some)\s+(.+)/i.test(lower)) {
    const listMatch = msg.match(/^(?:list|give me|what are some|examples of|name some)\s+(.+)/i);
    const topic = listMatch ? listMatch[1].replace(/\?+$/, "").trim() : "that";
    return `Here are some notable examples of ${topic}:\n\n1. **First example** — A well-known instance that illustrates the concept clearly.\n2. **Second example** — Another perspective that shows the range and variety.\n3. **Third example** — A more nuanced or advanced case worth considering.\n4. **Fourth example** — Shows how the concept applies in a different context.\n5. **Fifth example** — A creative or unconventional take that might surprise you.\n\nEach of these highlights a different facet of ${topic}. Would you like me to elaborate on any of them?`;
  }

  // Opinion / recommendation
  if (/^(?:should i|would you recommend|what do you recommend|what's the best|which is better)\s+(.+)/i.test(lower)) {
    return `That's a great question about making a choice! While I don't have personal preferences, here's how I'd think about it:\n\n1. **Clarify your priorities** — What matters most to you in this situation? Speed, cost, quality, simplicity?\n2. **Consider the trade-offs** — Every choice has benefits and drawbacks. Weigh them against your priorities.\n3. **Think about the long term** — How will this decision affect things down the road?\n4. **Start small if possible** — If you can test or try before fully committing, that often reduces risk.\n\nIf you share more specifics about your situation, I can give you a more tailored recommendation!`;
  }

  // Jokes
  if (/joke|make me laugh|funny/.test(lower)) {
    const jokes = [
      "Why don't programmers like nature? It has too many bugs!\n\nBut seriously, want to hear another one or shall we get back to business?",
      "Why did the developer go broke? Because they used up all their cache!\n\nI'm here all week. Ask me a real question whenever you're ready!",
      "There are 10 types of people in the world: those who understand binary and those who don't.\n\nWant another, or shall we tackle something more serious?",
      "Why do Java developers wear glasses? Because they don't C#!\n\nOkay, I'll see myself out. What can I help you with?",
      "A SQL query walks into a bar, walks up to two tables and asks: 'Can I join you?'\n\nWant another, or shall we get back to answering your questions?",
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
  }

  // Time / date
  if (/what time|what day|today's date|current (time|date)/.test(lower)) {
    const now = new Date();
    return `Right now it's **${now.toUTCString()}** (UTC).\n\nIs there something time-related you'd like help planning or scheduling?`;
  }

  // Weather (can't access real data)
  if (/weather|temperature|forecast|rain|sunny/.test(lower)) {
    return "I don't have access to real-time weather data, but I'd recommend checking a weather service like weather.com or your phone's built-in weather app for the most accurate forecast. Is there anything else I can help you with?";
  }

  // Yes/no with context
  if (/^(yes|no|yeah|nope|yep|sure|ok|okay|alright)\b/.test(lower)) {
    const lastAssistant = [...history].reverse().find((m) => m.role === "assistant");
    if (lastAssistant) {
      if (/^(yes|yeah|yep|sure|ok|okay|alright)\b/.test(lower)) {
        return "Great! Let's go deeper. Could you tell me a bit more about what specific aspect you'd like to explore? The more context you give me, the more helpful I can be.";
      } else {
        return "No problem at all! We can explore a different topic whenever you're ready. What else is on your mind?";
      }
    }
  }

  // Bye
  if (/^(bye|goodbye|see you|see ya|farewell|later|cya)\b/.test(lower)) {
    return "Goodbye! It was great chatting with you. Feel free to come back anytime you have questions or just want to talk. Take care!";
  }

  // Help
  if (/^help\b|what can you do|i need help/.test(lower)) {
    return "I'm here to help! Here are some things you can ask me:\n\n- **Definitions** — \"What is Python?\" or \"Explain machine learning\"\n- **How-to guidance** — \"How do I learn React?\" or \"How to start a startup\"\n- **Comparisons** — \"What's the difference between Python and JavaScript?\"\n- **Calculations** — \"What is 15 * 23 + 7?\"\n- **Lists & examples** — \"Give me examples of renewable energy sources\"\n- **Recommendations** — \"What's the best way to stay productive?\"\n- **Just chat** — Say hi, ask for a joke, or have a conversation!\n\nI know about: programming languages (Python, JavaScript, Java, C++, Go, Rust, Swift...), web technologies (React, Node.js, HTML, CSS...), AI & machine learning, databases, cloud computing, blockchain, space, biology, health, business, and much more!\n\nWhat would you like to know?";
  }

  // Fallback — try Wikipedia API for real answers on any topic
  const wikiResult = await fetchFromWikipedia(msg);
  if (wikiResult) {
    return wikiResult;
  }

  // Final fallback if Wikipedia didn't find anything
  const fallbacks = [
    `I looked into "${msg}" but couldn't find a specific answer. Here are some ways I can help:\n\n- Try rephrasing your question (e.g., "What is X?" or "Tell me about X")\n- Ask about a related topic — I have detailed knowledge about programming, AI, science, history, geography, health, business, and more\n- Break your question into a more specific part\n\nWhat would you like to explore?`,
    `I couldn't find a direct answer to "${msg}" in my knowledge base or through external lookup. Could you try asking in a different way? For example:\n\n- "What is [topic]?"\n- "Tell me about [topic]"\n- "Explain [topic]"\n\nI can answer questions about thousands of topics — programming, science, history, geography, technology, health, and much more!`,
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

// ─────────────────────────────────────────────────────────────────────────────
// WIKIPEDIA API — fetches real answers for any topic not in the knowledge base
// ─────────────────────────────────────────────────────────────────────────────

async function fetchFromWikipedia(query: string): Promise<string | null> {
  // Extract the key topic from the user's question
  const topic = extractTopic(query);
  if (!topic || topic.length < 2) return null;

  try {
    // Step 1: Search Wikipedia for the best matching article
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(topic)}&format=json&srlimit=1&srprop=`;
    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) return null;

    const searchData = await searchRes.json();
    const searchResults = searchData?.query?.search;
    if (!searchResults || searchResults.length === 0) return null;

    const title = searchResults[0].title;

    // Step 2: Fetch the article summary (first paragraph)
    const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const summaryRes = await fetch(summaryUrl);
    if (!summaryRes.ok) return null;

    const summaryData = await summaryRes.json();
    const extract = summaryData?.extract;
    if (!extract || extract.length < 20) return null;

    // Build a nicely formatted answer
    let answer = `**${summaryData.title}**\n\n${extract}`;

    // Add a link to read more
    const pageUrl = summaryData?.content_urls?.desktop?.page;
    if (pageUrl) {
      answer += `\n\n*Read more: ${pageUrl}*`;
    }

    return answer;
  } catch {
    return null;
  }
}

function extractTopic(query: string): string {
  const lower = query.toLowerCase().replace(/\?+$/, "").trim();

  // Remove common question prefixes to isolate the topic
  const prefixes = [
    "what is ", "what are ", "what's ", "what does ", "what do ",
    "define ", "explain ", "tell me about ", "tell me ",
    "who is ", "who are ", "who was ",
    "where is ", "where are ",
    "when is ", "when was ", "when did ",
    "how is ", "how are ",
    "describe ",
  ];

  let topic = lower;
  for (const prefix of prefixes) {
    if (topic.startsWith(prefix)) {
      topic = topic.substring(prefix.length);
      break;
    }
  }

  // Remove articles
  topic = topic.replace(/^(a|an|the)\s+/i, "").trim();

  // Remove trailing question words
  topic = topic.replace(/\s+(in|at|on|for|of|to)\s+.*/i, "").trim();

  return topic || query.trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// KNOWLEDGE LOOKUP — finds the best matching entry from the knowledge base
// ─────────────────────────────────────────────────────────────────────────────

function lookupKnowledge(query: string): KnowledgeEntry | null {
  const lower = query.toLowerCase().replace(/\?+$/, "").trim();

  // Exact keyword match (highest priority)
  for (const entry of knowledgeBase) {
    for (const keyword of entry.keywords) {
      const kw = keyword.trim().toLowerCase();
      if (lower === kw || lower === `what is ${kw}` || lower === `what's ${kw}` || lower === `define ${kw}` || lower === `explain ${kw}` || lower === `tell me about ${kw}`) {
        return entry;
      }
    }
  }

  // Contains match — query includes a keyword as a whole word
  for (const entry of knowledgeBase) {
    for (const keyword of entry.keywords) {
      const kw = keyword.trim().toLowerCase();
      const regex = new RegExp(`(^|\\s)${escapeRegex(kw)}(\\s|$)`, "i");
      if (regex.test(lower)) {
        return entry;
      }
    }
  }

  return null;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function formatAnswer(entry: KnowledgeEntry): string {
  let result = entry.answer;
  if (entry.followUp) {
    result += "\n\n" + entry.followUp;
  }
  if (entry.related && entry.related.length > 0) {
    result += "\n\n*Related topics: " + entry.related.map((r) => r).join(", ") + "*";
  }
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// DEFINITION FALLBACK — for topics not in the knowledge base
// ─────────────────────────────────────────────────────────────────────────────

async function generateDefinition(topic: string): Promise<string> {
  const cleanTopic = topic.replace(/\?+$/, "").trim();

  // Try Wikipedia first for a real answer
  const wikiResult = await fetchFromWikipedia(cleanTopic);
  if (wikiResult) {
    return wikiResult + "\n\nWould you like me to elaborate on any aspect of this?";
  }

  // Fallback to a structured response
  return `**${cleanTopic}** is an interesting topic. Here's what I can tell you:\n\nAt its core, ${cleanTopic} involves a set of concepts, principles, and practices that define how it works and why it matters. Understanding it requires looking at both the foundational ideas and the practical applications.\n\nKey aspects to consider:\n- **Fundamentals** — The basic principles and building blocks\n- **How it works** — The mechanisms and processes involved\n- **Why it matters** — The significance and real-world impact\n- **Applications** — Where and how it's used in practice\n\nI'd love to give you a more specific answer! Could you tell me more about what aspect of ${cleanTopic} you're most curious about? Or try asking me about a related topic — I have detailed knowledge about programming languages, web technologies, AI, science, health, business, and more.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVER
// ─────────────────────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { message, conversationId, history = [] }: ChatRequest = await req.json();

    if (!message || typeof message !== "string") {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = await generateResponse(message, history);

    // Simulate thinking delay for a more natural feel
    const delay = Math.min(600 + response.length * 2, 2000);
    await new Promise((resolve) => setTimeout(resolve, delay));

    let newConversationId = conversationId;
    let title: string | undefined;

    // If no conversation exists, create one
    if (!newConversationId) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      title = message.length > 40 ? message.substring(0, 40) + "..." : message;

      const { data, error } = await supabase
        .from("chat_conversations")
        .insert({ title })
        .select("id")
        .maybeSingle();

      if (error) {
        return new Response(
          JSON.stringify({ error: "Failed to create conversation" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      newConversationId = data?.id;
    }

    return new Response(
      JSON.stringify({
        response,
        conversationId: newConversationId,
        title,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Something went wrong" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
