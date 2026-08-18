# Real-Time Multiplayer Drawing & Guessing Game

A real-time multiplayer drawing and word-guessing game inspired by games like Skribbl.io. Players take turns drawing a selected word while other players try to guess it as quickly as possible.

The application uses **Socket.IO for real-time communication** and **Redis for shared game state, player state, scoring, and turn management**.

## Features

- Real-time multiplayer gameplay
- Real-time drawing synchronization
- Word selection with random word suggestions
- Custom word selection
- Real-time guessing and chat
- Time-based scoring
- Faster correct guesses receive higher scores
- Players can only score once per turn
- 60-second drawing turns
- Multiple rounds
- Automatic turn and round management
- Live turn result board
- Final game leaderboard
- 1st, 2nd, and 3rd place rankings
- Server-authoritative game state
- Game-state recovery for newly connected players
- Redis-backed player and game state
- Automatic drawing cleanup between turns
- Player join/disconnect handling

## Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Canvas API
- Socket.IO Client

### Backend

- Node.js
- TypeScript
- Socket.IO
- Redis
- ioredis

## Architecture

```text
                    ┌──────────────────────┐
                    │       Browser        │
                    │      Next.js         │
                    │       React          │
                    └──────────┬───────────┘
                               │
                               │ WebSocket
                               ▼
                    ┌──────────────────────┐
                    │      Socket.IO       │
                    │       Server         │
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
       ┌────────────┐   ┌────────────┐   ┌────────────┐
       │ Game State │   │   Player   │   │  Drawing   │
       │ Management │   │ Management │   │   State    │
       └──────┬─────┘   └──────┬─────┘   └──────┬─────┘
              │                │                │
              └────────────────┼────────────────┘
                               ▼
                    ┌──────────────────────┐
                    │        Redis         │
                    │ Shared Game & Player │
                    │        State         │
                    └──────────────────────┘
```
