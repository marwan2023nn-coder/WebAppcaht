# Copyright (c) 2016-present Sofa, Inc. All Rights Reserved.
# See License.txt for license information.
FROM postgres:14

RUN apt-get update && apt-get install -y ca-certificates

ARG MATTERMOST_VERSION
#
# Configure PostgreSQL
#

ENV POSTGRES_USER=mmuser
ENV POSTGRES_PASSWORD=mostest
ENV POSTGRES_DB=sofa_test

#
# Configure Sofa
#
WORKDIR /mm

# Copy over files
ADD https://releases.sofa.com/${MATTERMOST_VERSION}/sofa-team-${MATTERMOST_VERSION}-linux-amd64.tar.gz .
RUN tar -zxvf sofa-team-${MATTERMOST_VERSION}-linux-amd64.tar.gz
ADD config_docker.json ./sofa/config/config_docker.json
ADD docker-entry.sh .

RUN chmod +x ./docker-entry.sh
ENTRYPOINT ./docker-entry.sh

# Sofa environment variables
ENV PATH="/mm/sofa/bin:${PATH}"

# Create default storage directory
RUN mkdir ./sofa-data
VOLUME /mm/sofa-data

# Ports
EXPOSE 8065
