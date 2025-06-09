FROM rust:slim-bookworm AS base

WORKDIR /skills

# Apt Update
RUN apt-get update && \
    rm -rf /var/lib/apt/lists/*

# Install Deno
COPY --from=denoland/deno:bin-2.3.5 /deno /usr/local/bin/deno

# Install curl
RUN apt-get update && \
    apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*


# Install Doppler
RUN apt-get update && apt-get install -y apt-transport-https ca-certificates curl gnupg && \
    curl -sLf --retry 3 --tlsv1.2 --proto "=https" 'https://packages.doppler.com/public/cli/gpg.DE2A7741A397C129.key' | gpg --dearmor -o /usr/share/keyrings/doppler-archive-keyring.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/doppler-archive-keyring.gpg] https://packages.doppler.com/public/cli/deb/debian any-version main" | tee /etc/apt/sources.list.d/doppler-cli.list && \
    apt-get update && apt-get install doppler

FROM base AS local

# Install git
RUN apt-get update && \
    apt-get install -y git openssh-server && \
    rm -rf /var/lib/apt/lists/*

# Configure SSH
RUN mkdir -p /var/run/sshd
RUN echo 'root:password' | chpasswd
RUN sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config
RUN sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config
RUN echo "Port 2221" >> /etc/ssh/sshd_config

# Add Spacetime
RUN curl -sSf https://install.spacetimedb.com | sh -s -- --yes
ENV PATH="/root/.local/bin:$PATH"
