FROM node:25.1.0-slim AS base

WORKDIR /skills

# Apt Update
RUN apt-get update && \
    rm -rf /var/lib/apt/lists/*

# Install curl and build tools for native modules
RUN apt-get update && \
    apt-get install -y curl wget python3 build-essential libreadline-dev && \
    rm -rf /var/lib/apt/lists/*

RUN wget -qO- https://get.pnpm.io/install.sh | ENV="$HOME/.bashrc" SHELL="$(which bash)" bash -
ENV PATH="/root/.local/share/pnpm:$PATH"


# Install Infisical CLI
RUN curl -1sLf 'https://artifacts-cli.infisical.com/setup.deb.sh' | bash && \
    apt-get update && \
    apt-get install -y infisical && \
    rm -rf /var/lib/apt/lists/*

FROM base AS local

# Install git and openssh-server for development
RUN apt-get update && \
    apt-get install -y git openssh-server && \
    rm -rf /var/lib/apt/lists/*

# Install Claude
RUN npm install -g @anthropic-ai/claude-code

# Configure SSH
RUN mkdir -p /var/run/sshd
RUN echo 'root:password' | chpasswd
RUN sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config
RUN sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config
RUN echo "Port 2221" >> /etc/ssh/sshd_config

FROM base AS service
COPY . .
RUN pnpm install --frozen-lockfile

FROM caddy:2-alpine AS frontend
COPY services/frontend/dist /srv
COPY services/frontend/Caddyfile /etc/caddy/Caddyfile
