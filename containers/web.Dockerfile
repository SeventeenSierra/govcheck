# SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
# SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

# Development Dockerfile for Next.js web application
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@10.25.0

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install dependencies (allow lockfile updates in development)
RUN pnpm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Set environment variables for development
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

# Start development server
CMD ["pnpm", "dev"]