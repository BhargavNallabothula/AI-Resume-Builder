const state = {
  userId: localStorage.getItem("resumeai_user_id") || crypto.randomUUID(),
  data: {},
  resume: null,
  busy: false
};
localStorage.setItem("resumeai_user_id", state.userId);

const els = {
  messages: document.getElementById("chatMessages"),
  form: document.getElementById("chatForm"),
  input: document.getElementById("messageInput"),
  send: document.getElementById("sendBtn"),
  saveStatus: document.getElementById("saveStatus"),
  progress: document.getElementById("progressBar"),
  completion: document.getElementById("completion"),
  resumeCard: document.getElementById("resumeCard"),
  resumeMessage: document.getElementById("resumeMessage"),
  viewResume: document.getElementById("viewResumeBtn"),
  modal: document.getElementById("resumeModal"),
  resumeContent: document.getElementById("resumeContent"),
  download: document.getElementById("downloadBtn"),
  newChat: document.getElementById("newChatBtn"),
  suggestions: document.getElementById("suggestions")
};

const welcome = "Hi! I’m your AI resume builder. I’ll ask you a few focused questions and turn your answers into an ATS-friendly resume. To start, are you a student/fresher, or do you already have work experience?";

function addMessage(role, text) {
  const row = document.createElement("div");
  row.className = `message ${role}`;
  row.innerHTML = `
    <div class="avatar">${role === "ai" ? "AI" : "YOU"}</div>
    <div class="bubble"></div>
  `;
  row.querySelector(".bubble").textContent = text;
  els.messages.appendChild(row);
  els.messages.scrollTop = els.messages.scrollHeight;
}

function addTyping() {
  const row = document.createElement("div");
  row.className = "message ai typing";
  row.id = "typing";
  row.innerHTML = `<div class="avatar">AI</div><div class="bubble"><i class="dot"></i><i class="dot"></i><i class="dot"></i></div>`;
  els.messages.appendChild(row);
  els.messages.scrollTop = els.messages.scrollHeight;
}

function removeTyping() {
  document.getElementById("typing")?.remove();
}

function hasValue(v) {
  if (Array.isArray(v)) return v.length > 0;
  if (v && typeof v === "object") return Object.values(v).some(hasValue);
  return v !== null && v !== undefined && String(v).trim() !== "";
}

function calculateProgress(s) {
  const checks = [
    hasValue(s.contact),
    hasValue(s.experience_level),
    hasValue(s.education),
    hasValue(s.skills),
    hasValue(s.work_experience) || hasValue(s.internships) || hasValue(s.projects),
    hasValue(s.certifications) || hasValue(s.extras)
  ];
  return Math.round(checks.filter(Boolean).length / checks.length * 100);
}

function updateProfile(s = {}) {
  state.data = s;
  const contact = s.contact || {};
  const education = s.education || [];
  const skills = s.skills || {};
  const experience = s.work_experience || [];
  const internships = s.internships || [];
  const projects = s.projects || [];
  const certifications = s.certifications || [];

  const contactText = contact.full_name || contact.email || "Not collected";
  const expCount = experience.length + internships.length;
  const expText = expCount ? `${expCount} item${expCount > 1 ? "s" : ""}` : (s.experience_level ? s.experience_level : "Not collected");
  const eduText = education.length ? `${education.length} education item${education.length > 1 ? "s" : ""}` : "Not collected";
  const skillCount = (skills.technical || []).length + (skills.soft || []).length;
  const skillText = skillCount ? `${skillCount} skills` : "Not collected";
  const projectText = projects.length ? `${projects.length} project${projects.length > 1 ? "s" : ""}` : "Not collected";
  const certText = certifications.length ? `${certifications.length} certification${certifications.length > 1 ? "s" : ""}` : "Optional";

  setCard("contact", contactText, hasValue(contact));
  setCard("experience", expText, expCount > 0);
  setCard("education", eduText, education.length > 0);
  setCard("skills", skillText, skillCount > 0);
  setCard("projects", projectText, projects.length > 0);
  setCard("certifications", certText, certifications.length > 0);

  const progress = calculateProgress(s);
  els.progress.style.width = `${progress}%`;
  els.completion.textContent = `${progress}%`;
}

function setCard(section, text, done) {
  const card = document.querySelector(`[data-section="${section}"]`);
  document.getElementById(`${section}Summary`).textContent = text;
  document.getElementById(`${section}Check`).textContent = done ? "✓" : "○";
  card.classList.toggle("done", done);
}

function setBusy(busy) {
  state.busy = busy;
  els.send.disabled = busy;
  els.input.disabled = busy;
  els.saveStatus.textContent = busy ? "● Thinking…" : "● Saved locally";
}

async function sendMessage(message) {
  const clean = message.trim();
  if (!clean || state.busy) return;
  addMessage("user", clean);
  els.input.value = "";
  els.input.style.height = "auto";
  addTyping();
  setBusy(true);

  try {
    const response = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: clean, user_id: state.userId })
    });
    const payload = await response.json();
    removeTyping();

    if (!response.ok) throw new Error(payload.detail || "Request failed");

    if (payload.ai_reply) addMessage("ai", payload.ai_reply);
    if (payload.state) updateProfile(payload.state);

    if (payload.resume) {
      state.resume = payload.resume;
      els.resumeMessage.textContent = "Your resume is ready. Review it before exporting.";
      els.viewResume.disabled = false;
      els.resumeContent.textContent = payload.resume;
      openModal();
    }
  } catch (error) {
    removeTyping();
    addMessage("ai", `I couldn’t reach the resume service. ${error.message}`);
  } finally {
    setBusy(false);
    els.input.focus();
  }
}

function openModal() {
  els.modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}
function closeModal() {
  els.modal.classList.add("hidden");
  document.body.style.overflow = "";
}

els.form.addEventListener("submit", e => {
  e.preventDefault();
  sendMessage(els.input.value);
});

els.input.addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    els.form.requestSubmit();
  }
});

els.input.addEventListener("input", () => {
  els.input.style.height = "auto";
  els.input.style.height = `${Math.min(els.input.scrollHeight, 120)}px`;
});

els.suggestions.addEventListener("click", e => {
  const btn = e.target.closest("[data-suggestion]");
  if (!btn) return;
  sendMessage(btn.dataset.suggestion);
});

els.viewResume.addEventListener("click", openModal);
document.querySelectorAll("[data-close]").forEach(el => el.addEventListener("click", closeModal));

els.download.addEventListener("click", () => {
  if (!state.resume) return;
  const blob = new Blob([state.resume], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "resume.md";
  a.click();
  URL.revokeObjectURL(url);
});

els.newChat.addEventListener("click", () => {
  if (!confirm("Start a new resume interview? Your current chat history in the database will remain unchanged.")) return;
  state.userId = crypto.randomUUID();
  localStorage.setItem("resumeai_user_id", state.userId);
  state.data = {};
  state.resume = null;
  els.messages.innerHTML = "";
  els.viewResume.disabled = true;
  els.resumeMessage.textContent = "Complete the interview and I’ll generate a polished, ATS-friendly resume here.";
  updateProfile({});
  addMessage("ai", welcome);
});

addMessage("ai", welcome);
updateProfile({});
els.input.focus();
