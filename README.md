# 🧵 Thread-Scoute

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](#license)
[![Next.js](https://img.shields.io/badge/Built_with-Next.js-black?logo=next.js)]()
[![Database](https://img.shields.io/badge/Database-MongoDB-green?logo=mongodb)]()
[![Auth](https://img.shields.io/badge/Auth-Clerk-blue?logo=clerk)]()
[![Stars](https://img.shields.io/github/stars/AbdullahBakouni/Thread-Scoute?style=social)]()

> A modern **social media platform** built with **Next.js (14+)**, **Server Actions**, **MongoDB**, and **Clerk Auth** —  
> enabling real-time conversations, post threads, replies, and profile engagement in a clean developer-first stack.

---

## 🖥️ Overview

**Thread-Scoute** allows users to:
- Create threads and reply to others  
- Follow creators and explore trending discussions  
- Auth securely with **Clerk** (Email / OAuth / Social Login)  
- Store data in **MongoDB** with Mongoose models  
- Handle all mutations via **Next.js Server Actions** for zero-API friction  
- Enjoy a **real-time, server-less experience** powered by Next.js and edge functions

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-------------|
| Frontend | Next.js 14 (App Router), React, TailwindCSS |
| Backend | Next.js Server Actions, TypeScript |
| Database | MongoDB (Atlas) + Mongoose |
| Authentication | Clerk (Auth, Sessions, Webhooks) |
| Caching / Realtime | Edge Cache / Next Revalidate Tags |
| Deployment | Vercel |
| Dev Tools | ESLint, Prettier, TypeScript Strict |

---

## ✨ Features

- 🔐 Secure authentication via Clerk (OAuth + Email)
- 🧵 Create / reply / delete threads
- 💬 Nested comment system
- 🧑‍🤝‍🧑 Follow / unfollow users
- 📈 Explore trending and recommended threads
- ⚡ Server Actions for database writes — no API routes required
- 🪶 Responsive, lightweight UI using TailwindCSS
- ☁️ Deployed seamlessly on Vercel

---

## 🗺️ Architecture Diagram

```mermaid
flowchart TD
    U[User or Browser] --> F[Next.js App - App Router and Server Actions]
    F --> A[Clerk Authentication Service]
    F --> DB[MongoDB Database]
    F --> S[Edge Storage and Cache]
    A --> F
    DB --> F
    F --> U
```
# ⚙️ Installation
1️⃣ Clone the repo
```bash
git clone https://github.com/AbdullahBakouni/Thread-Scoute.git
cd Thread-Scoute
```
2️⃣ Install dependencies
```bash
npm install
# or
yarn install
```
3️⃣ Create .env.local
```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_**************
CLERK_SECRET_KEY=sk_test_**************

# MongoDB
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/threadscoute

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4️⃣ Run development server
```bash
npm run dev
```
# 🧪 API / Server Action Examples

Although Thread-Scoute uses Server Actions, the logic is equivalent to REST endpoints:

| Action                     | Description                    |
| -------------------------- | ------------------------------ |
| `createThread(formData)`   | Create a new thread post       |
| `deleteThread(id)`         | Remove thread and replies      |
| `replyToThread(id, text)`  | Reply to an existing thread    |
| `toggleFollow(userId)`     | Follow / unfollow a user       |
| `getUserProfile(username)` | Fetch user profile and threads |


Example Usage (in Next.js Server Action):
```ts
'use server';

import { revalidatePath } from 'next/cache';
import Thread from '@/models/thread';

export async function createThread(formData: FormData) {
  const content = formData.get('content') as string;
  const authorId = formData.get('authorId') as string;

  await Thread.create({ content, author: authorId });
  revalidatePath('/');
}
```
# 🧩 Folder Structure
```psql
📦 Thread-Scoute
 ┣ 📂 app
 ┃ ┣ 📂 (routes)
 ┃ ┣ 📜 layout.tsx
 ┃ ┣ 📜 page.tsx
 ┣ 📂 lib
 ┃ ┗ 📜 db.ts
 ┣ 📂 models
 ┃ ┣ 📜 thread.ts
 ┃ ┗ 📜 user.ts
 ┣ 📂 components
 ┣ 📂 actions
 ┃ ┣ 📜 createThread.ts
 ┃ ┗ 📜 toggleFollow.ts
 ┣ 📜 .env.local.example
 ┣ 📜 package.json
 ┗ 📜 README.md
```
# 🛣️ Roadmap

 Add image & video upload support

 Integrate notifications feed

 Add likes & bookmarks

 Real-time websockets for comments

 Dark / Light theme toggle

# 🤝 Contributing

Fork this repo

Create your branch (git checkout -b feature/new-feature)

Commit your changes (git commit -m "feat: new feature")

Push to your branch and open a PR 🚀

# 📜 License

Licensed under the MIT License © 2025 [Abdullah Bakouni](https://github.com/AbdullahBakouni)

# 🌐 Visit My Website

👉 https://thread-scoute.vercel.app/
