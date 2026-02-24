# FROM ubuntu:noble-20240605@sha256:2e863c44b718727c860746568e1d54afd13b2fa71b160f5cd9058fc436217b30 AS base
FROM ubuntu:24.04 AS base
FROM base AS build

SHELL ["/bin/bash", "-o", "pipefail", "-c"]


RUN apt-get update \
  && DEBIAN_FRONTEND=noninteractive apt-get install --no-install-recommends -y \
  ca-certificates \
  curl \
  git \
  make \
  && rm -rf /var/lib/apt/lists/*

# install nvm
ARG NVM_DIR=/usr/local/nvm
ARG NVM_VERSION=v0.40.4
ARG NODE_VERSION=v24.13.0

RUN mkdir $NVM_DIR
# https://github.com/creationix/nvm#install-script
WORKDIR /nvm_install

RUN curl -ko install.sh https://raw.githubusercontent.com/nvm-sh/nvm/$NVM_VERSION/install.sh

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
COPY --from=build /webapp/${FRONT_PKG} .
COPY backend/bin/${SERVER_VERSION}  ./bin
COPY backend/bin/entrypoint.sh  ./bin/entrypoint.sh 
# COPY backend/tb_tar/${SERVER_VERSION}  ./tb_tar
COPY backend/config  ./config
COPY backend/fonts  ./fonts
COPY backend/i18n  ./i18n
COPY backend/templates  ./templates

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
