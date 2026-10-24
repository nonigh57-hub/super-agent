const $ = (id) => document.getElementById(id);
const messages = $("messages");
let voiceEnabled = true;
let deferredInstallPrompt = null;
let pendingAction = null;

const copy = {
  bn: {
    welcome: "আমি Super Agent-এর প্রথম প্রোটোটাইপ। আমি সাধারণ নির্দেশ বুঝে ডেমো উত্তর দিতে, পরিকল্পনা সাজাতে এবং একটি ছোট HTML starter project তৈরি করতে পারি। লাইভ AI ও খবরের সংযোগ এখনো নেই।",
    help: "আমি এই প্রোটোটাইপে তিনটি কাজ করতে পারি: (১) কাজের পরিকল্পনা, (২) একটি HTML starter project তৈরি, (৩) অনুমতি নেওয়ার ডেমো। আসল AI উত্তর ও লাইভ খবরের জন্য পরে নিরাপদ AI/API সংযোগ যোগ করতে হবে।",
    plan: "আপনার কাজের জন্য একটি সাধারণ পরিকল্পনা:\n১. লক্ষ্য ও প্রয়োজনীয়তা লিখুন।\n২. কাজটিকে ছোট ধাপে ভাগ করুন।\n৩. প্রথম ছোট সংস্করণ তৈরি করুন।\n৪. পরীক্ষা করে ভুল ঠিক করুন।\n৫. গুরুত্বপূর্ণ কাজের আগে আপনার অনুমতি নিন।\n\nআপনি নির্দিষ্ট প্রজেক্টের নাম ও লক্ষ্য লিখলে আমি এই ডেমোতে আরও উপযোগী পরিকল্পনা সাজাতে পারি।",
    project: "আমি একটি HTML starter project ফাইল তৈরি করতে পারি। নিচের Build Project বোতামটি ব্যবহার করলে আগে অনুমতি চাইব, তারপর ফাইল ডাউনলোড হবে। এটি AI-উৎপন্ন পূর্ণ অ্যাপ নয়—এটি একটি প্রাথমিক টেমপ্লেট।",
    news: "এই সংস্করণে লাইভ ইন্টারনেট অনুসন্ধান যুক্ত নেই, তাই আমি বর্তমান বিশ্বসংবাদ যাচাই করে বলতে পারি না। পরবর্তী সংস্করণে সংবাদ API বা সার্চ টুল যুক্ত করা যাবে।",
    permission: "নিরাপত্তার নিয়ম: কোনো বাহ্যিক কাজ, ফাইল পরিবর্তন বা বার্তা পাঠানোর আগে কী কাজ হবে তা স্পষ্ট করে অনুমতি নিতে হবে। এই প্রোটোটাইপে শুধু অনুমতি-ডায়ালগটি দেখানো হয়।",
    unknown: "আমি এখনো পূর্ণ AI মডেলের সঙ্গে সংযুক্ত নই, তাই সব প্রশ্নের নির্ভরযোগ্য উত্তর দিতে পারি না। আপনি “plan”, “project”, “news” বা “permission” লিখে প্রোটোটাইপের ফিচার পরীক্ষা করতে পারেন।"
  },
  en: {
    welcome: "I am the first Super Agent prototype. I can provide demo responses, organize a task plan, and create a small HTML starter project. Live AI and news integrations are not connected yet.",
    help: "In this prototype I can: (1) plan a task, (2) create an HTML starter project, and (3) demonstrate an approval step. Real AI answers and live news require a secure AI/API integration.",
    plan: "A basic plan:\n1. Define the goal and requirements.\n2. Break the task into small steps.\n3. Build a small first version.\n4. Test it and fix issues.\n5. Ask for your approval before important actions.\n\nTell me the project name and goal for a more tailored demo plan.",
    project: "I can create an HTML starter project file. Use the Build Project button below; I will ask for approval before downloading it. This is a starter template, not a complete AI-generated application.",
    news: "Live web search is not connected in this version, so I cannot verify current world news. A news API or search tool can be added in a later version.",
    permission: "Safety rule: before an external action, file change, or message is sent, the agent should explain what it will do and ask permission. This prototype only demonstrates the approval dialog.",
    unknown: "I am not connected to a full AI model yet, so I cannot reliably answer every question. Try “plan”, “project”, “news”, or “permission” to test the prototype."
  }
};

function getLang() {
  const chosen = $("language").value;
  if (chosen === "bn-BD") return "bn";
  if (chosen === "en-US") return "en";
  return /[\u0980-\u09FF]/.test($("userInput").value) ? "bn" : "en";
}
function addMessage(text, who = "assistant") {
  const article = document.createElement("article");
  article.className = `message ${who}`;
  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = who === "assistant" ? "✦" : "You";
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  if (who === "assistant") {
    const name = document.createElement("strong");
    name.textContent = "Super Agent";
    bubble.appendChild(name);
  }
  const p = document.createElement("p");
  p.textContent = text;
  bubble.appendChild(p);
  article.append(avatar, bubble);
  messages.appendChild(article);
  messages.scrollTop = messages.scrollHeight;
}
function chooseResponse(text) {
  const lang = getLang();
  const t = text.toLowerCase();
  const data = copy[lang];
  if (/(hello|hi\b|hey|হ্যালো|হাই|আসসালামু|সালাম)/i.test(t)) {
    return lang === "bn" ? "হ্যালো! আমি Super Agent। আপনি কী তৈরি করতে বা পরিকল্পনা করতে চান?" : "Hello! I’m Super Agent. What would you like to build or plan?";
  }
  if (/(help|সাহায্য|কি করতে পার|what can you do)/i.test(t)) return data.help;
  if (/(plan|পরিকল্পনা|ধাপ|কীভাবে শুরু|কিভাবে শুরু)/i.test(t)) return data.plan;
  if (/(project|website|web app|অ্যাপ|প্রজেক্ট|প্রকল্প|ওয়েবসাইট|ওয়েবসাইট)/i.test(t)) return data.project;
  if (/(news|খবর|সংবাদ|current event|latest)/i.test(t)) return data.news;
  if (/(permission|অনুমতি|approve|নিরাপত্তা)/i.test(t)) return data.permission;
  if (/(who are you|তুমি কে|তোমার নাম)/i.test(t)) return lang === "bn" ? "আমার নাম Super Agent। আমি এখন একটি প্রোটোটাইপ; AI মডেল যুক্ত করলে আরও বেশি প্রশ্নের উত্তর দিতে ও টুল ব্যবহার করতে পারব।" : "I’m Super Agent, currently a prototype. Connecting an AI model will let me answer more questions and use tools.";
  return data.unknown;
}
function speak(text) {
  if (!voiceEnabled || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const lang = getLang();
  utterance.lang = lang === "bn" ? "bn-BD" : "en-US";
  const voices = window.speechSynthesis.getVoices();
  const desired = $("voiceStyle").value;
  const candidates = voices.filter(v => v.lang.toLowerCase().startsWith(lang === "bn" ? "bn" : "en"));
  const genderMatch = candidates.find(v => desired === "female" ? /female|woman|zira|samantha|aria|jenny/i.test(v.name) : /male|man|david|mark|guy/i.test(v.name));
  if (genderMatch) utterance.voice = genderMatch;
  else if (candidates[0]) utterance.voice = candidates[0];
  utterance.rate = 1;
  utterance.pitch = desired === "female" ? 1.08 : 0.9;
  window.speechSynthesis.speak(utterance);
}
function answer(text) {
  const response = chooseResponse(text);
  addMessage(response, "assistant");
  speak(response);
}
$("chatForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const text = $("userInput").value.trim();
  if (!text) return;
  addMessage(text, "user");
  $("userInput").value = "";
  $("userInput").style.height = "auto";
  window.setTimeout(() => answer(text), 250);
});
$("userInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    $("chatForm").requestSubmit();
  }
});
$("userInput").addEventListener("input", function() {
  this.style.height = "auto";
  this.style.height = Math.min(this.scrollHeight, 140) + "px";
});
$("speakToggle").addEventListener("click", () => {
  voiceEnabled = !voiceEnabled;
  $("speakToggle").textContent = voiceEnabled ? "🔊 Voice on" : "🔇 Voice off";
  $("speakToggle").setAttribute("aria-pressed", String(voiceEnabled));
  if (!voiceEnabled && "speechSynthesis" in window) window.speechSynthesis.cancel();
});
$("micBtn").addEventListener("click", () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    addMessage("এই ব্রাউজারে speech recognition সমর্থিত নয়। Chrome-এর আপডেটেড সংস্করণ ব্যবহার করুন অথবা টাইপ করে নির্দেশ দিন।", "assistant");
    return;
  }
  const rec = new SpeechRecognition();
  rec.lang = $("language").value === "en-US" ? "en-US" : "bn-BD";
  rec.interimResults = false;
  rec.maxAlternatives = 1;
  $("micBtn").textContent = "🎙️ Listening…";
  rec.onresult = (event) => {
    $("userInput").value = event.results[0][0].transcript;
    $("chatForm").requestSubmit();
  };
  rec.onerror = (event) => addMessage("Voice input error: " + event.error + ". মাইক্রোফোন অনুমতি ও ইন্টারনেট সংযোগ পরীক্ষা করুন।", "assistant");
  rec.onend = () => $("micBtn").textContent = "🎙️ Speak";
  try { rec.start(); } catch (err) { $("micBtn").textContent = "🎙️ Speak"; addMessage("মাইক্রোফোন শুরু করা যায়নি। আবার চেষ্টা করুন।", "assistant"); }
});
$("clearBtn").addEventListener("click", () => {
  messages.replaceChildren();
  addMessage(getLang() === "bn" ? "চ্যাট পরিষ্কার হয়েছে। কী করতে চান?" : "Chat cleared. What would you like to do?", "assistant");
});
function openApproval(action, description) {
  pendingAction = action;
  $("approvalText").textContent = description;
  $("approvalDialog").showModal();
}
$("denyBtn").addEventListener("click", () => {
  pendingAction = null;
  addMessage(getLang() === "bn" ? "ঠিক আছে, কাজটি বাতিল করা হয়েছে।" : "Okay, the action was cancelled.", "assistant");
});
$("approveBtn").addEventListener("click", (e) => {
  e.preventDefault();
  const action = pendingAction;
  pendingAction = null;
  $("approvalDialog").close();
  if (action === "project") downloadProject();
  else addMessage(getLang() === "bn" ? "ডেমো অনুমতি গৃহীত হয়েছে। এখানে কোনো বাইরের কাজ করা হয়নি।" : "Demo approval granted. No external action was performed.", "assistant");
});
function downloadProject() {
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>My Project</title>
<style>body{font-family:system-ui;margin:0;background:#101425;color:#f4f6ff;display:grid;place-items:center;min-height:100vh;text-align:center;padding:24px}main{max-width:620px;background:#1b2338;border:1px solid #394461;border-radius:24px;padding:32px}button{padding:12px 18px;border:0;border-radius:12px;background:#8fe5dc;font-weight:bold}</style></head>
<body><main><h1>My Starter Project</h1><p>This is a starter web page generated by Super Agent Prototype.</p><button onclick="document.querySelector('#result').textContent='Button works!'">Test button</button><p id="result"></p></main></body></html>`;
  const blob = new Blob([html], {type: "text/html;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "my-starter-project.html";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  addMessage(getLang() === "bn" ? "অনুমতি দেওয়ার পর my-starter-project.html ডাউনলোড শুরু হয়েছে। ফাইলটি ব্রাউজারের Downloads-এ খুঁজুন।" : "After approval, my-starter-project.html should download. Find it in your browser Downloads.", "assistant");
}
document.querySelectorAll("[data-tool]").forEach(button => {
  button.addEventListener("click", () => {
    const tool = button.dataset.tool;
    if (tool === "project") {
      addMessage(chooseResponse("project"), "assistant");
      openApproval("project", "Download a basic HTML starter project to your device?");
    } else if (tool === "permission") {
      addMessage(chooseResponse("permission"), "assistant");
      openApproval("demo", "Run a harmless demo action? No external changes will be made.");
    } else if (tool === "plan") {
      addMessage(chooseResponse("plan"), "assistant");
    } else if (tool === "news") {
      addMessage(chooseResponse("news"), "assistant");
    }
  });
});
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  $("installBtn").classList.remove("hidden");
});
$("installBtn").addEventListener("click", async () => {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  $("installBtn").classList.add("hidden");
});
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
}
if ("speechSynthesis" in window) window.speechSynthesis.onvoiceschanged = () => {};
