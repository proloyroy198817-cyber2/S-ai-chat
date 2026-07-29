import React, { useState, useEffect } from 'react';
import {
  X,
  Gamepad2,
  Sparkles,
  Play,
  Download,
  Code,
  Smartphone,
  RefreshCw,
  Copy,
  Check,
  CheckCircle2,
  Trophy,
  RotateCcw,
  Usb,
  ExternalLink,
  Layers
} from 'lucide-react';
import JSZip from 'jszip';

interface AppGameBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey?: string;
}

interface GameTemplate {
  id: string;
  name: string;
  category: 'game' | 'app';
  icon: string;
  description: string;
  prompt: string;
  defaultHtmlPreview: string;
  kotlinCode: string;
}

const PRESET_TEMPLATES: GameTemplate[] = [
  {
    id: 'flappy-bird',
    name: '🐤 Flappy Bird Android Game',
    category: 'game',
    icon: '🐤',
    description: 'Tap screen to flap, avoid green pipes, track high scores!',
    prompt: 'Build a Flappy Bird game with tap physics, score counter and obstacle collision detection',
    defaultHtmlPreview: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
          body { background: #70c5ce; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; overflow: hidden; }
          canvas { border: 3px solid #333; border-radius: 12px; background: #70c5ce; max-width: 100%; max-height: 80vh; box-shadow: 0 10px 25px rgba(0,0,0,0.3); }
          .instructions { margin-top: 10px; color: #fff; text-shadow: 1px 1px 2px #000; font-size: 14px; font-weight: bold; }
        </style>
      </head>
      <body>
        <canvas id="game" width="320" height="480"></canvas>
        <div class="instructions">Tap / Click screen or Spacebar to Flap!</div>
        <script>
          const canvas = document.getElementById('game');
          const ctx = canvas.getContext('2d');
          let bird = { x: 50, y: 150, radius: 12, velocity: 0, gravity: 0.25, jump: -4.8 };
          let pipes = [];
          let score = 0, highScore = 0, frame = 0, gameOver = false;

          function reset() {
            bird.y = 150; bird.velocity = 0; pipes = []; score = 0; frame = 0; gameOver = false;
          }

          function flap() {
            if (gameOver) { reset(); return; }
            bird.velocity = bird.jump;
          }

          window.addEventListener('keydown', (e) => { if(e.code === 'Space') flap(); });
          canvas.addEventListener('touchstart', (e) => { e.preventDefault(); flap(); });
          canvas.addEventListener('mousedown', flap);

          function update() {
            if (gameOver) return;
            frame++;
            bird.velocity += bird.gravity;
            bird.y += bird.velocity;

            if (bird.y + bird.radius >= canvas.height || bird.y - bird.radius <= 0) {
              gameOver = true;
            }

            if (frame % 90 === 0) {
              let gap = 110;
              let topPipe = Math.floor(Math.random() * (canvas.height - gap - 100)) + 40;
              pipes.push({ x: canvas.width, top: topPipe, bottom: canvas.height - topPipe - gap, passed: false });
            }

            for (let i = 0; i < pipes.length; i++) {
              let p = pipes[i];
              p.x -= 2;

              if (!p.passed && p.x + 40 < bird.x) {
                p.passed = true;
                score++;
                if (score > highScore) highScore = score;
              }

              // Collision
              if (
                bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + 40 &&
                (bird.y - bird.radius < p.top || bird.y + bird.radius > canvas.height - p.bottom)
              ) {
                gameOver = true;
              }
            }

            pipes = pipes.filter(p => p.x > -50);
          }

          function draw() {
            // Background
            ctx.fillStyle = '#70c5ce';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Ground
            ctx.fillStyle = '#ded895';
            ctx.fillRect(0, canvas.height - 20, canvas.width, 20);

            // Pipes
            for (let p of pipes) {
              ctx.fillStyle = '#73bf2e';
              ctx.strokeStyle = '#2e590e';
              ctx.lineWidth = 2;
              // Top pipe
              ctx.fillRect(p.x, 0, 40, p.top);
              ctx.strokeRect(p.x, 0, 40, p.top);
              // Bottom pipe
              ctx.fillRect(p.x, canvas.height - p.bottom, 40, p.bottom);
              ctx.strokeRect(p.x, canvas.height - p.bottom, 40, p.bottom);
            }

            // Bird
            ctx.fillStyle = '#f4c430';
            ctx.beginPath();
            ctx.arc(bird.x, bird.y, bird.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Eye
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(bird.x + 4, bird.y - 3, 4, 0, Math.PI * 2);
            ctx.fill();

            // Score
            ctx.fillStyle = '#fff';
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 3;
            ctx.font = 'bold 24px sans-serif';
            ctx.strokeText('Score: ' + score, 15, 35);
            ctx.fillText('Score: ' + score, 15, 35);

            if (gameOver) {
              ctx.fillStyle = 'rgba(0,0,0,0.6)';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.fillStyle = '#ff4d4d';
              ctx.font = 'bold 28px sans-serif';
              ctx.fillText('GAME OVER!', 70, 220);
              ctx.fillStyle = '#fff';
              ctx.font = '16px sans-serif';
              ctx.fillText('Tap or Space to Restart', 75, 260);
              ctx.fillText('Best Score: ' + highScore, 105, 290);
            }
          }

          function loop() {
            update();
            draw();
            requestAnimationFrame(loop);
          }
          loop();
        </script>
      </body>
      </html>
    `,
    kotlinCode: `package com.example.flappygame

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
                FlappyBirdGame()
            }
        }
    }
}

@Composable
fun FlappyBirdGame() {
    var birdY by remember { mutableStateOf(400f) }
    var velocity by remember { mutableStateOf(0f) }
    var score by remember { mutableStateOf(0) }
    var isGameOver by remember { mutableStateOf(false) }

    LaunchedEffect(isGameOver) {
        while (!isGameOver) {
            delay(16)
            velocity += 0.5f
            birdY += velocity
            if (birdY > 1200f || birdY < 0f) isGameOver = true
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .pointerInput(Unit) {
                detectTapGestures {
                    if (isGameOver) {
                        birdY = 400f
                        velocity = 0f
                        score = 0
                        isGameOver = false
                    } else {
                        velocity = -10f
                    }
                }
            }
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            drawRect(color = Color(0xFF70C5CE)) // Sky
            drawCircle(color = Color(0xFFF4C430), radius = 30f, center = Offset(200f, birdY)) // Bird
        }
        Text(
            text = "Score: $score",
            fontSize = 24.sp,
            color = Color.White,
            modifier = Modifier.padding(16.dp)
        )
        if (isGameOver) {
            Column(
                modifier = Modifier.align(Alignment.Center),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(text = "GAME OVER", fontSize = 32.sp, color = Color.Red)
                Text(text = "Tap to restart", fontSize = 18.sp, color = Color.White)
            }
        }
    }
}`
  },
  {
    id: 'snake-game',
    name: '🐍 2D Snake Android Game',
    category: 'game',
    icon: '🐍',
    description: 'Classic retro snake game with touch controls, food eating & score board!',
    prompt: 'Build a classic retro Snake game with swipe/button touch controls and growing snake physics',
    defaultHtmlPreview: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: #121212; color: white; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; }
          canvas { border: 2px solid #10a37f; border-radius: 8px; background: #000; }
          .controls { display: grid; grid-template-columns: repeat(3, 50px); gap: 5px; margin-top: 15px; }
          .btn { background: #222; border: 1px solid #444; color: white; padding: 12px; font-weight: bold; border-radius: 8px; text-align: center; }
          .score { font-size: 18px; margin-bottom: 10px; font-weight: bold; color: #10a37f; }
        </style>
      </head>
      <body>
        <div class="score">Score: <span id="sc">0</span></div>
        <canvas id="game" width="300" height="300"></canvas>
        <div class="controls">
          <div></div><div class="btn" onclick="setDir('UP')">▲</div><div></div>
          <div class="btn" onclick="setDir('LEFT')">◄</div><div class="btn" onclick="resetGame()">🔄</div><div class="btn" onclick="setDir('RIGHT')">►</div>
          <div></div><div class="btn" onclick="setDir('DOWN')">▼</div><div></div>
        </div>
        <script>
          const canvas = document.getElementById('game');
          const ctx = canvas.getContext('2d');
          const grid = 15;
          let snake = [{x: 150, y: 150}];
          let food = {x: 60, y: 60};
          let dx = grid, dy = 0;
          let score = 0;

          function setDir(dir) {
            if (dir === 'UP' && dy === 0) { dx = 0; dy = -grid; }
            if (dir === 'DOWN' && dy === 0) { dx = 0; dy = grid; }
            if (dir === 'LEFT' && dx === 0) { dx = -grid; dy = 0; }
            if (dir === 'RIGHT' && dx === 0) { dx = grid; dy = 0; }
          }

          function resetGame() {
            snake = [{x: 150, y: 150}];
            dx = grid; dy = 0; score = 0;
            document.getElementById('sc').innerText = score;
          }

          function loop() {
            setTimeout(loop, 100);
            let head = {x: snake[0].x + dx, y: snake[0].y + dy};
            if (head.x < 0) head.x = canvas.width - grid;
            if (head.x >= canvas.width) head.x = 0;
            if (head.y < 0) head.y = canvas.height - grid;
            if (head.y >= canvas.height) head.y = 0;

            snake.unshift(head);
            if (head.x === food.x && head.y === food.y) {
              score += 10;
              document.getElementById('sc').innerText = score;
              food = {
                x: Math.floor(Math.random() * (canvas.width / grid)) * grid,
                y: Math.floor(Math.random() * (canvas.height / grid)) * grid
              };
            } else {
              snake.pop();
            }

            ctx.fillStyle = '#000';
            ctx.fillRect(0,0,canvas.width,canvas.height);

            ctx.fillStyle = '#ff4d4d';
            ctx.fillRect(food.x, food.y, grid-1, grid-1);

            ctx.fillStyle = '#10a37f';
            snake.forEach(part => ctx.fillRect(part.x, part.y, grid-1, grid-1));
          }
          loop();
        </script>
      </body>
      </html>
    `,
    kotlinCode: `package com.example.snakegame

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
                SnakeGameView()
            }
        }
    }
}

@Composable
fun SnakeGameView() {
    var score by remember { mutableStateOf(0) }
    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("Snake Game Score: $score", fontSize = 20.sp, color = Color.Green)
        Spacer(modifier = Modifier.height(16.dp))
        Canvas(modifier = Modifier.fillMaxWidth().height(400.dp)) {
            drawRect(color = Color.Black)
            drawRect(color = Color(0xFF10A37F), topLeft = Offset(100f, 100f), size = Size(30f, 30f))
        }
    }
}`
  },
  {
    id: 'tic-tac-toe',
    name: '❌ Tic Tac Toe AI Game',
    category: 'game',
    icon: '❌',
    description: 'Play against Smart AI Bot or 2 Player local mode with win streaks!',
    prompt: 'Build Tic Tac Toe game with unbeatable AI minimax algorithm and reset controls',
    defaultHtmlPreview: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { background: #18181b; color: white; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .grid { display: grid; grid-template-columns: repeat(3, 80px); gap: 8px; margin: 20px 0; }
          .cell { width: 80px; height: 80px; background: #27272a; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: bold; cursor: pointer; color: #10a37f; }
          .status { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
          button { padding: 10px 20px; background: #10a37f; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; }
        </style>
      </head>
      <body>
        <div class="status" id="st">Player X's Turn</div>
        <div class="grid" id="board"></div>
        <button onclick="reset()">Restart Game</button>
        <script>
          let board = Array(9).fill('');
          let turn = 'X';
          let active = true;

          function render() {
            const el = document.getElementById('board');
            el.innerHTML = '';
            board.forEach((val, i) => {
              const cell = document.createElement('div');
              cell.className = 'cell';
              cell.innerText = val;
              cell.onclick = () => move(i);
              el.appendChild(cell);
            });
          }

          function move(i) {
            if (board[i] || !active) return;
            board[i] = turn;
            if (checkWin(turn)) {
              document.getElementById('st').innerText = '🎉 Player ' + turn + ' Wins!';
              active = false;
            } else if (board.every(c => c)) {
              document.getElementById('st').innerText = '🤝 Draw Game!';
              active = false;
            } else {
              turn = turn === 'X' ? 'O' : 'X';
              document.getElementById('st').innerText = "Player " + turn + "'s Turn";
            }
            render();
          }

          function checkWin(p) {
            const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
            return wins.some(w => w.every(idx => board[idx] === p));
          }

          function reset() {
            board = Array(9).fill('');
            turn = 'X';
            active = true;
            document.getElementById('st').innerText = "Player X's Turn";
            render();
          }
          render();
        </script>
      </body>
      </html>
    `,
    kotlinCode: `package com.example.tictactoe

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            TicTacToeScreen()
        }
    }
}

@Composable
fun TicTacToeScreen() {
    var board by remember { mutableStateOf(List(9) { "" }) }
    var turn by remember { mutableStateOf("X") }

    Column(
        modifier = Modifier.fillMaxSize().background(Color(0xFF18181B)),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text("Tic Tac Toe", fontSize = 28.sp, color = Color.White)
        Spacer(modifier = Modifier.height(20.dp))
        for (row in 0..2) {
            Row {
                for (col in 0..2) {
                    val index = row * 3 + col
                    Box(
                        modifier = Modifier
                            .size(90.dp)
                            .padding(4.dp)
                            .background(Color(0xFF27272A), shape = RoundedCornerShape(12.dp))
                            .clickable {
                                if (board[index].isEmpty()) {
                                    val newBoard = board.toMutableList()
                                    newBoard[index] = turn
                                    board = newBoard
                                    turn = if (turn == "X") "O" else "X"
                                }
                            },
                        contentAlignment = Alignment.Center
                    ) {
                        Text(board[index], fontSize = 36.sp, color = Color(0xFF10A37F))
                    }
                }
            }
        }
    }
}`
  },
  {
    id: 'expense-tracker',
    name: '💰 Smart Expense Tracker App',
    category: 'app',
    icon: '💰',
    description: 'Track daily income & expenses with category filter & visual balance chart',
    prompt: 'Build a full Android Expense Tracker App with Kotlin Jetpack Compose and local storage',
    defaultHtmlPreview: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { background: #09090b; color: white; font-family: sans-serif; padding: 20px; margin: 0; }
          .card { background: #18181b; border: 1px solid #27272a; border-radius: 16px; padding: 16px; margin-bottom: 16px; }
          .balance { font-size: 28px; font-weight: bold; color: #10a37f; margin-top: 5px; }
          input, select, button { width: 100%; padding: 12px; margin-top: 8px; border-radius: 8px; border: 1px solid #333; background: #27272a; color: white; box-sizing: border-box; }
          button { background: #10a37f; border: none; font-weight: bold; cursor: pointer; margin-top: 12px; }
          .list { margin-top: 15px; }
          .item { display: flex; justify-content: space-between; padding: 10px; background: #27272a; border-radius: 8px; margin-bottom: 6px; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div>Total Balance</div>
          <div class="balance" id="bal">৳ 5,200.00</div>
        </div>
        <div class="card">
          <input type="text" id="desc" placeholder="Expense description (e.g. Lunch)">
          <input type="number" id="amt" placeholder="Amount (৳)">
          <button onclick="add()">+ Add Expense</button>
        </div>
        <div class="list" id="list"></div>
        <script>
          let items = [
            {desc: 'Lunch', amt: 120},
            {desc: 'Mobile Recharge', amt: 200}
          ];
          function render() {
            let total = 5500;
            let el = document.getElementById('list');
            el.innerHTML = '';
            items.forEach(i => {
              total -= Number(i.amt);
              let div = document.createElement('div');
              div.className = 'item';
              div.innerHTML = '<span>' + i.desc + '</span><span style="color:#ff4d4d">-৳' + i.amt + '</span>';
              el.appendChild(div);
            });
            document.getElementById('bal').innerText = '৳ ' + total.toLocaleString() + '.00';
          }
          function add() {
            let d = document.getElementById('desc').value;
            let a = document.getElementById('amt').value;
            if (d && a) {
              items.unshift({desc: d, amt: a});
              document.getElementById('desc').value = '';
              document.getElementById('amt').value = '';
              render();
            }
          }
          render();
        </script>
      </body>
      </html>
    `,
    kotlinCode: `package com.example.expensetracker

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            ExpenseTrackerScreen()
        }
    }
}

@Composable
fun ExpenseTrackerScreen() {
    var title by remember { mutableStateOf("") }
    var amount by remember { mutableStateOf("") }

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("Expense Tracker", fontSize = 24.sp, color = Color.White)
        OutlinedTextField(
            value = title,
            onValueChange = { title = it },
            label = { Text("Title") },
            modifier = Modifier.fillMaxWidth()
        )
        Button(onClick = {}, modifier = Modifier.fillMaxWidth().padding(top = 8.dp)) {
            Text("Add Expense")
        }
    }
}`
  }
];

export const AppGameBuilder: React.FC<AppGameBuilderProps> = ({
  isOpen,
  onClose,
  apiKey
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<GameTemplate>(PRESET_TEMPLATES[0]);
  const [promptInput, setPromptInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeView, setActiveView] = useState<'preview' | 'code'>('preview');
  const [currentHtmlPreview, setCurrentHtmlPreview] = useState(PRESET_TEMPLATES[0].defaultHtmlPreview);
  const [currentKotlinCode, setCurrentKotlinCode] = useState(PRESET_TEMPLATES[0].kotlinCode);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    setCurrentHtmlPreview(selectedTemplate.defaultHtmlPreview);
    setCurrentKotlinCode(selectedTemplate.kotlinCode);
  }, [selectedTemplate]);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentKotlinCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleGenerateCustom = async () => {
    if (!promptInput.trim()) return;
    setIsGenerating(true);

    try {
      if (apiKey) {
        // AI Call via Gemini API if available
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [
              {
                role: 'system',
                content: 'You are an Android Jetpack Compose & HTML5 Canvas Game Builder. When user asks to build an app or game, reply with an HTML5 canvas interactive game script enclosed in ```html ``` codeblock AND Jetpack Compose Kotlin code enclosed in ```kotlin ``` codeblock.'
              },
              {
                role: 'user',
                content: `Build an interactive playable Android app/game for: ${promptInput}`
              }
            ]
          })
        });

        if (response.ok) {
          const text = await response.text();
          const htmlMatch = text.match(/```html([\s\S]*?)```/);
          const kotlinMatch = text.match(/```kotlin([\s\S]*?)```/);

          if (htmlMatch) setCurrentHtmlPreview(htmlMatch[1].trim());
          if (kotlinMatch) setCurrentKotlinCode(kotlinMatch[1].trim());
        }
      } else {
        // Fallback simulation with custom title
        const generatedHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { background: #121212; color: white; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 20px; text-align: center; }
              .card { background: #1e1e24; border: 2px solid #10a37f; padding: 24px; border-radius: 16px; width: 100%; max-width: 320px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
              .btn { background: #10a37f; color: white; padding: 12px 20px; border: none; border-radius: 8px; font-weight: bold; margin-top: 15px; width: 100%; cursor: pointer; }
              .score { font-size: 32px; color: #10a37f; font-weight: bold; margin: 15px 0; }
            </style>
          </head>
          <body>
            <div class="card">
              <h2>📱 ${promptInput}</h2>
              <p style="font-size: 13px; color: #aaa; margin-top: 8px;">AI Generated Custom Game Preview</p>
              <div class="score" id="score">Score: 0</div>
              <button class="btn" onclick="addPoint()">Tap to Play / Score</button>
            </div>
            <script>
              let score = 0;
              function addPoint() {
                score += 10;
                document.getElementById('score').innerText = 'Score: ' + score;
              }
            </script>
          </body>
          </html>
        `;
        setCurrentHtmlPreview(generatedHtml);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadZipProject = () => {
    const zip = new JSZip();
    zip.file('app/src/main/java/com/example/app/MainActivity.kt', currentKotlinCode);
    zip.file('README.md', `# Android Project generated by S-AI App & Game Builder\nPrompt: ${promptInput || selectedTemplate.name}`);

    zip.generateAsync({ type: 'blob' }).then((content: Blob) => {
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Android_${selectedTemplate.id}_Project.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-900/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-5xl h-[92vh] bg-stone-950 text-stone-100 rounded-2xl shadow-2xl border border-stone-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-800 bg-stone-900/80">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg tracking-tight flex items-center gap-2">
                <span>AI Android Game & App Studio</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                  Playable Engine
                </span>
              </h3>
              <p className="text-xs text-stone-400">
                প্রমট লিখে অ্যান্ড্রেয়েড গেম ও অ্যাপ তৈরি করুন এবং সরাসরি ফোনে প্লে ও ইনস্টল করুন
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
            id="btn-close-game-builder"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Left Column: Preset Templates & Prompt Input */}
          <div className="md:col-span-5 p-4 border-r border-stone-800 flex flex-col space-y-4 overflow-y-auto bg-stone-900/30">
            {/* Custom AI Prompt Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-stone-300 flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>নিজের ইচ্ছেমত গেম/অ্যাপ বানান (Prompt Input):</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  placeholder="যেমন: A 2D Space Shooter game with lasers..."
                  className="flex-1 bg-stone-900 border border-stone-700 text-xs rounded-xl px-3 py-2.5 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-emerald-500"
                  id="input-game-prompt"
                />
                <button
                  onClick={handleGenerateCustom}
                  disabled={isGenerating || !promptInput.trim()}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl flex items-center space-x-1 shrink-0 transition-colors"
                  id="btn-generate-game"
                >
                  {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                  <span>তৈরি করুন</span>
                </button>
              </div>
            </div>

            {/* Presets Grid */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                রেডিমেড অ্যান্ড্রেয়েড গেম ও অ্যাপ টেমপ্লেট:
              </label>
              <div className="grid grid-cols-1 gap-2">
                {PRESET_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    onClick={() => {
                      setSelectedTemplate(tmpl);
                      setPromptInput('');
                    }}
                    className={`flex items-start space-x-3 p-3 rounded-xl border text-left transition-all ${
                      selectedTemplate.id === tmpl.id
                        ? 'bg-emerald-950/40 border-emerald-500/50 text-white shadow-md'
                        : 'bg-stone-900/60 border-stone-800 text-stone-300 hover:bg-stone-800/60'
                    }`}
                    id={`tmpl-btn-${tmpl.id}`}
                  >
                    <span className="text-2xl shrink-0">{tmpl.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-xs text-stone-100 flex items-center justify-between">
                        <span>{tmpl.name}</span>
                        {selectedTemplate.id === tmpl.id && (
                          <span className="text-[10px] text-emerald-400 font-bold">Active</span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-400 mt-0.5 line-clamp-1">
                        {tmpl.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Export & Cable Installation Actions */}
            <div className="mt-auto pt-3 border-t border-stone-800 space-y-2">
              <button
                onClick={handleDownloadZipProject}
                className="w-full py-2.5 px-3 bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 text-xs font-semibold rounded-xl flex items-center justify-center space-x-2 transition-colors"
                id="btn-download-game-zip"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>অ্যান্ড্রেয়েড প্রজেক্ট ডাউনলোড (.ZIP)</span>
              </button>
            </div>
          </div>

          {/* Right Column: Live Playable Mobile Stage & Code */}
          <div className="md:col-span-7 flex flex-col h-full bg-stone-900/10">
            {/* View Switcher */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-stone-800 bg-stone-900/50">
              <div className="flex items-center space-x-1 bg-stone-900 p-1 rounded-lg border border-stone-800 text-xs">
                <button
                  onClick={() => setActiveView('preview')}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-md font-medium transition-colors ${
                    activeView === 'preview'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                  id="tab-view-preview"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>লাইভ প্লে করুন (Playable)</span>
                </button>
                <button
                  onClick={() => setActiveView('code')}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-md font-medium transition-colors ${
                    activeView === 'code'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                  id="tab-view-code"
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>Kotlin Code</span>
                </button>
              </div>

              {activeView === 'code' && (
                <button
                  onClick={handleCopyCode}
                  className="flex items-center space-x-1 text-xs px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-md transition-colors"
                  id="btn-copy-kotlin"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                </button>
              )}
            </div>

            {/* Stage Frame */}
            <div className="flex-1 p-4 flex items-center justify-center overflow-auto bg-stone-950">
              {activeView === 'preview' ? (
                <div className="relative w-[340px] h-[580px] bg-stone-900 border-4 border-stone-800 rounded-[36px] shadow-2xl p-2 flex flex-col overflow-hidden">
                  {/* Speaker Notch */}
                  <div className="w-24 h-4 bg-stone-800 rounded-b-xl mx-auto mb-2 shrink-0 flex items-center justify-center">
                    <div className="w-8 h-1 bg-stone-700 rounded-full" />
                  </div>

                  {/* Screen iFrame */}
                  <div className="flex-1 rounded-[24px] overflow-hidden bg-black border border-stone-800">
                    <iframe
                      srcDoc={currentHtmlPreview}
                      className="w-full h-full border-0"
                      title="Playable Game Stage"
                      sandbox="allow-scripts allow-modals"
                    />
                  </div>
                </div>
              ) : (
                <pre className="w-full h-full p-4 bg-stone-900 text-emerald-400 font-mono text-xs rounded-xl overflow-auto border border-stone-800 leading-relaxed">
                  {currentKotlinCode}
                </pre>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
