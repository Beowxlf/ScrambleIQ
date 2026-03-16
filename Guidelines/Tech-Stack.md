# ScrambleIQ Technology Stack

## Purpose

This document defines the official technology stack used to build ScrambleIQ. The goal of defining the stack early is to eliminate ambiguity for developers, contributors, and AI coding agents working in the repository.

ScrambleIQ is designed as a grappling match analysis platform that allows coaches to analyze matches through video playback, timeline interaction, and event tagging. The architecture must support interactive video tools in phase one and future machine learning based analysis.

The stack is selected to balance development speed, maintainability, scalability, and compatibility with future AI processing.

---

# System Architecture Overview

ScrambleIQ follows a three layer architecture:

1. Frontend application
2. Backend API
3. Data and media storage

This separation allows the user interface, business logic, and data processing layers to evolve independently.

System overview:
Browser Client
|
Frontend Application
|
Backend API
|
Database and Video Storage
|
Future Machine Learning Services


The frontend handles user interaction, the backend manages business logic and persistence, and storage systems manage structured data and video files.

---

# Frontend Stack

## Framework

React

React is used to build the interactive user interface for ScrambleIQ. The application requires dynamic UI elements such as video playback controls, tagging tools, and timeline visualization. React provides a mature ecosystem for building these interfaces.

Reasons for selecting React:

- widely adopted frontend framework
- strong ecosystem and community support
- efficient state management options
- good compatibility with TypeScript

---

## Language

TypeScript

TypeScript provides static typing for JavaScript applications and improves maintainability of larger codebases.

Reasons for using TypeScript:

- improved developer tooling
- compile time error detection
- safer refactoring
- improved readability of domain models

---

## Build Tool

Vite

Vite is used as the development server and build tool for the frontend application.

Reasons for using Vite:

- fast development server
- modern module bundling
- optimized production builds
- strong compatibility with React and TypeScript

---

# Backend Stack

## Runtime

Node.js

Node.js provides the runtime environment for the backend API.

Reasons for selecting Node.js:

- allows full stack TypeScript development
- large ecosystem of libraries
- efficient handling of API requests
- easy integration with modern frontend frameworks

---

## Backend Framework

NestJS

NestJS provides a structured architecture for building scalable backend services.

Reasons for selecting NestJS:

- strong architectural patterns
- modular design
- dependency injection support
- native TypeScript support
- good support for REST APIs

Alternative frameworks such as Express could be used for simple services, but NestJS provides better long term maintainability for larger systems.

---

# Database

## Primary Database

PostgreSQL

PostgreSQL is used as the primary relational database.

Reasons for selecting PostgreSQL:

- reliable relational data model
- strong indexing and query performance
- widely supported across cloud providers
- suitable for structured match and analytics data

Example data entities include:

- matches
- athletes
- event tags
- timeline events
- analysis sessions

---

# Video Storage

Match videos should not be stored directly in the relational database.

Instead, video files are stored in object storage.

## Development Environment

During development, videos may be stored in the local filesystem.

## Production Environment

Recommended object storage systems:

- AWS S3
- Cloudflare R2
- Backblaze B2

Object storage provides scalability and efficient file delivery.

---

# Video Processing

## Tool

FFmpeg

FFmpeg is used for video processing tasks.

Example uses include:

- frame extraction
- video transcoding
- clip generation
- format normalization

This tool is widely used in video platforms and integrates well with backend services.

---

# Machine Learning Layer (Future Phase)

Phase one does not include automated video analysis or pose estimation.

However, the architecture must allow integration with a future machine learning pipeline.

The recommended ML stack is:

Language:
- Python

Libraries:
- PyTorch
- OpenCV
- MediaPipe
- Transformers

Machine learning models will run in a separate service and communicate with the backend API.

---

# Development Tooling

Development tooling ensures consistent code quality across the project.

## Linting

Tool:
ESLint

Purpose:

- enforce consistent coding standards
- detect common programming errors
- maintain code readability

---

## Code Formatting

Tool:
Prettier

Purpose:

- maintain consistent code formatting
- reduce formatting related merge conflicts

---

## Testing

Tool:
Vitest

Vitest is used for unit testing.

Reasons for using Vitest:

- fast execution
- native TypeScript support
- strong integration with Vite
- compatible with React component testing

---

# API Testing

Tool:
Supertest

Supertest can be used for testing backend API endpoints.

Purpose:

- verify REST API behavior
- validate response structures
- test authentication flows

---

# Infrastructure

Initial infrastructure should remain simple.

## Frontend Hosting

Recommended:

Vercel

Reasons:

- easy deployment
- optimized for frontend frameworks
- fast global CDN delivery

---

## Backend Deployment

Recommended approach:

Docker container deployment.

Benefits:

- consistent runtime environment
- easier scaling
- simplified deployment pipeline

---

## Database Hosting

Recommended managed PostgreSQL providers:

- Supabase
- Neon
- AWS RDS

Managed services reduce operational overhead.

---

# Phase One Stack Summary

Phase one uses a simplified version of the full stack.
Frontend
React
TypeScript
Vite

Backend
Node.js
NestJS

Database
PostgreSQL

Storage
Local filesystem for development

Development Tooling
ESLint
Prettier
Vitest


This stack supports rapid development of the initial coaching tools while remaining compatible with future ML integration.

---

# Future Expansion

Later phases introduce additional infrastructure:

Machine Learning Service
Python
PyTorch

Video Processing
FFmpeg

Cloud Storage
AWS S3 or equivalent object storage


This architecture supports advanced analytics such as automated event detection and motion analysis.

---

# Summary

The ScrambleIQ technology stack is designed to support both immediate development needs and long term platform growth.

Key characteristics of the stack include:

- full stack TypeScript development
- strong frontend interactivity
- scalable backend architecture
- relational database for analytics
- object storage for video data
- future machine learning compatibility

This architecture provides a stable foundation for building the ScrambleIQ platform.

---

# Abbreviations

API  
Application Programming Interface

ML  
Machine Learning

UI  
User Interface

SaaS  
Software as a Service

CLI  
Command Line Interface

CDN  
Content Delivery Network
