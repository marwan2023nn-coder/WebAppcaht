# FROM ubuntu:noble-20240605@sha256:2e863c44b718727c860746568e1d54afd13b2fa71b160f5cd9058fc436217b30 AS base
FROM ubuntu:24.04 AS base
RUN apt-get update \
  && DEBIAN_FRONTEND=noninteractive apt-get install --no-install-recommends -y \
  ca-certificates \
  curl \
  git \
  make \
  && rm -rf /var/lib/apt/lists/*

#__________________________________________________________________
FROM base AS server-build

ARG GO_VERSION=1.26.1
ARG TARGETOS=linux
ARG TARGETARCH=amd64
ARG BUILD_NUMBER
ARG BUILD_TAGS

ENV BUILD_NUMBER=$BUILD_NUMBER
ENV BUILD_TAGS=$BUILD_TAGS

RUN curl -fsSL "https://go.dev/dl/go${GO_VERSION}.${TARGETOS}-${TARGETARCH}.tar.gz" \
    | tar -C /usr/local -xz

ENV PATH="/usr/local/go/bin:${PATH}"
ENV GOPATH="/go"
# ENV GOBIN="/go/bin"

WORKDIR /server
COPY server .

RUN make setup-go-work
RUN make build-cmd-linux

# #+++++++++++++[debug]++++++++++++
# RUN ls -la / & ls -la  & ls -la bin/ 
# RUN find /server -name "mattermost" -o -name "mmctl" 2>/dev/null | head -20
# # #++++++++++++++++++++++++++++++++
RUN mkdir -p /server/bin/build
RUN mv /server/bin/mattermost /server/bin/build/workspace && \
    mv /server/bin/mmctl /server/bin/build/wsctl

#__________________________________________________________________
FROM base AS webapp-build

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

RUN apt-get update && apt-get install -y \
    autoconf \
    automake \
    libtool \
    pkg-config \
    libpng-dev \
    gifsicle \
    nasm \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# install nvm
ARG NVM_DIR=/usr/local/nvm
ARG NVM_VERSION=v0.40.4
ARG NODE_VERSION=v24.13.0

RUN mkdir $NVM_DIR
# https://github.com/creationix/nvm#install-script
WORKDIR /nvm_install

# RUN curl -ko install.sh https://raw.githubusercontent.com/nvm-sh/nvm/$NVM_VERSION/install.sh
COPY ./assets/nvm/v0.40.4/install.sh install.sh

RUN chmod +x install.sh

RUN bash install.sh

ARG NODE_PATH=$NVM_DIR/versions/node/$NODE_VERSION/bin
ARG PATH=$NVM_DIR/versions/node/$NODE_VERSION/bin:$PATH
# ARG NODE_ENV=production

# install node and npm
RUN echo "source $NVM_DIR/nvm.sh && \
    nvm install $NODE_VERSION && \
    nvm alias default $NODE_VERSION && \
    nvm use default" | bash

#----------

WORKDIR /webapp

COPY webapp .

# RUN npm install
# RUN npm install @fortawesome/fontawesome-free

# Install the missing FontAwesome package
# RUN npm install @fortawesome/free-regular-svg-icons --no-save


RUN make package

RUN rm -rf node_modules

#__________________________________________________________________
FROM base AS deploy

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# Build Arguments
ARG PUID=1000
ARG PGID=1000
ARG POSTGRES_VERSION=17
ARG SERVER_VERSION=11.3.0
ARG FRONT_PKG=workspace-webapp.tar.gz          
ARG APP_USER=workspace
ARG APP_DIR=/opt/workspace


RUN apt-get update \
&& DEBIAN_FRONTEND=noninteractive apt-get install --no-install-recommends -y \
ca-certificates \
curl \
media-types \
dos2unix \
mailcap \
unrtf \
wv \
poppler-utils \
gnupg \
tidy \
tzdata \
&& rm -rf /var/lib/apt/lists/*



RUN . /etc/os-release \
  && echo "deb http://apt.postgresql.org/pub/repos/apt ${VERSION_CODENAME}-pgdg main" > /etc/apt/sources.list.d/pgdg.list \
  && curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc -o /etc/apt/trusted.gpg.d/pgdg.gpg.asc \
  && apt-get update \
  && apt-get install --no-install-recommends -y "postgresql-client-${POSTGRES_VERSION}" \
  && rm -f /etc/apt/sources.list.d/pgdg.list \
  && rm -rf /var/lib/apt/lists/*



  #  ${APP_DIR}/tb_tar  \
RUN mkdir -p ${APP_DIR}/data \
             ${APP_DIR}/plugins \
             ${APP_DIR}/client/plugins \
             ${APP_DIR}/i18n \
             ${APP_DIR}/templates \
             ${APP_DIR}/config


WORKDIR ${APP_DIR}
COPY --from=server-build /server/bin/build/  ./bin/
COPY --from=server-build /server/fonts  ./fonts
COPY --from=server-build /server/i18n  ./i18n
COPY --from=server-build /server/templates  ./templates
COPY --from=webapp-build /webapp/${FRONT_PKG} .
# COPY backend/bin/entrypoint.sh  ./bin/entrypoint.sh 
# COPY backend/tb_tar/${SERVER_VERSION}  ./tb_tar
# COPY backend/config  ./config

# ENV BACKUP_DIR="${APP_DIR}/tb_tar"

RUN tar -xvzf ${FRONT_PKG} && rm -f ${FRONT_PKG}

# # Set workspace group/user and download workspace

# RUN groupadd --gid ${PGID} ${APP_USER} \
#   && useradd --uid ${PUID} --gid ${PGID} --comment "" --home-dir ${APP_DIR} workspace \
#   && chown -R ${APP_USER}:${APP_USER} ${APP_DIR}

# We should refrain from running as privileged user
RUN \
    if getent passwd ${PUID} > /dev/null; then \
        EXISTING_USER=$(getent passwd ${PUID} | cut -d: -f1); \
        userdel $EXISTING_USER; \
    fi; \
    if getent group ${PGID} > /dev/null; then \
        EXISTING_GROUP=$(getent group ${PGID} | cut -d: -f1); \
        groupdel $EXISTING_GROUP; \
    fi; \
    groupadd --gid ${PGID} ${APP_USER}; \
    useradd --uid ${PUID} --gid ${PGID} --comment "" --home-dir ${APP_DIR} ${APP_USER}; \
    chown -R ${APP_USER}:${APP_USER} ${APP_DIR} && \
    chmod +x ${APP_DIR}/bin/workspace


ENV PATH="${APP_DIR}/bin:${PATH}"

# # We should refrain from running as privileged user
USER ${APP_USER}

# Configure entrypoint and command with proper permissions
WORKDIR ${APP_DIR}/bin

# Healthcheck to make sure container is ready
HEALTHCHECK --interval=30s --timeout=10s \
  CMD curl -f http://localhost:8065/api/v4/system/ping || exit 1
EXPOSE 8065


CMD ["./workspace"]
