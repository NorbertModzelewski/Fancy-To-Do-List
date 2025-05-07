const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");

const app = express();

// ✅ CORS KONFIGURACJA
app.use(cors()); // ← pełna otwartość
app.use(express.json()); // zamiast body-parser

// ✅ MODELE
const User = mongoose.model("User", new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true }
}));

const Task = mongoose.model("Task", new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  sharedWith: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    default: []
  },
  title: String,
  priority: Number,
  deadline: String,
  description: String,
  status: { type: String, default: "to-do" }
}));

// ✅ MONGO CONNECT
mongoose.connect('mongodb+srv://admin:admin123@todoapp.kzkgdx3.mongodb.net/todoapp?retryWrites=true&w=majority&appName=todoapp')
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

// ✅ REJESTRACJA
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.json({ userId: user._id });
  } catch {
    res.status(400).json({ error: "Użytkownik już istnieje" });
  }
});

// ✅ LOGOWANIE (tylko raz!)
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(401).json({ error: "Nieprawidłowy login" });

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) return res.status(401).json({ error: "Nieprawidłowe hasło" });

  res.json({ userId: user._id });
});

// ✅ DODAWANIE TASKA
app.post("/tasks", async (req, res) => {
  const task = new Task(req.body);
  await task.save();
  res.json({ taskId: task._id });
});

// ✅ POBIERANIE TASKÓW DLA UŻYTKOWNIKA
app.get("/tasks/:userId", async (req, res) => {
  const userId = req.params.userId.trim();

  const tasks = await Task.find({
    $or: [
      { userId: new mongoose.Types.ObjectId(userId) },
      { sharedWith: new mongoose.Types.ObjectId(userId) }
    ]
  }).populate("userId", "username");

  console.log("✅ Zadania znalezione dla:", userId);
  res.json(tasks);
});
// ✅ USUWANIE TASKA
app.delete("/tasks/:id", async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Błąd podczas usuwania" });
  }
});

// ✅ EDYCJA TASKA
app.put("/tasks/:id", async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedTask);
  } catch {
    res.status(500).json({ error: "Nie udało się zaktualizować taska" });
  }
});

app.post("/tasks/:taskId/share", async (req, res) => {
  const { taskId } = req.params;
  const { targetUsername } = req.body;

  try {
    console.log("🎯 Próba udostępnienia taska:", taskId, "dla użytkownika:", targetUsername);

    const task = await Task.findById(taskId);
    if (!task) {
      console.log("❌ Nie znaleziono taska:", taskId);
      return res.status(404).json({ error: "Nie znaleziono taska" });
    }

    const user = await User.findOne({ username: targetUsername });
    if (!user) {
      console.log("❌ Nie znaleziono użytkownika:", targetUsername);
      return res.status(404).json({ error: "Nie znaleziono użytkownika" });
    }

    const targetUserId = user._id;

    const sharedWithSafe = Array.isArray(task.sharedWith) ? task.sharedWith : [];

    const alreadyShared = sharedWithSafe
      .map(id => id?.toString?.())
      .includes(targetUserId.toString());
    
    if (!alreadyShared) {
      task.sharedWith = [...sharedWithSafe, targetUserId];
      await task.save();
      console.log("✅ Dodano do sharedWith:", targetUserId.toString());
    } else {
      console.log("⚠️ Task już był udostępniony temu użytkownikowi");
    }
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Błąd udostępniania:", err);
    res.status(500).json({ error: "Błąd serwera" });
  }
});
// ✅ START SERWERA
app.listen(3000, () => console.log("🚀 Server działa na http://localhost:3000"));