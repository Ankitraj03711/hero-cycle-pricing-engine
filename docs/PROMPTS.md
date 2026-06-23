# AI Prompts Used During Development

This document lists the key prompts used with AI tools (Kiro/Claude) during the development of this project.

## 1. Initial Project Setup & Planning

**Prompt:**
> "I have to do this project" (attached the assignment PDF)

**Context:** Used Kiro AI assistant to scaffold the entire project based on the assignment brief. The AI helped with:
- Analyzing the problem statement
- Suggesting tech stack (Node.js + React)
- Creating project structure
- Writing documentation

## 2. Problem Breakdown & Requirements

**Prompt:**
> "Help me break down the Hero Cycles pricing engine problem into user stories, identify questions I should ask, and document my assumptions."

**Output:** The PROBLEM_BREAKDOWN.md document with questions, assumptions, and user stories.

## 3. Database Schema Design

**Prompt:**
> "Design a database schema for a cycle pricing engine that needs to track parts with categories, cycle configurations, and price history."

**Output:** SQLite schema with 4 tables — parts, configurations, configuration_parts, price_history.

## 4. Backend API Implementation

**Prompt:**
> "Build an Express.js REST API with CRUD for parts (with categories and price history) and configurations (with price breakdown calculation). Use better-sqlite3."

**Output:** Complete backend with routes, models, and error handling.

## 5. Frontend Implementation

**Prompt:**
> "Create a React frontend with Tailwind CSS that has: parts management page, configuration builder with live total, and configuration list with price breakdown view."

**Output:** React components with Tailwind styling.

## 6. Testing

**Prompt:**
> "Write unit tests for the pricing calculation logic and parts CRUD operations using Vitest."

**Output:** Test file covering core business logic.

## 7. UI Design Decisions

**Prompt:**
> "What's the most intuitive UI layout for a salesperson who needs to quickly build a cycle configuration and see pricing?"

**Output:** Card-based category picker with running total — optimized for speed over aesthetics.

---

**Note:** All AI-generated code was reviewed, understood, and modified as needed. The architecture decisions and business logic choices are my own reasoning applied on top of AI assistance.
