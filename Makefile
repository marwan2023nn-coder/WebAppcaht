
# Define variables
OS ?= $(shell uname -s)
CONTAINER_REGISTRY = git.sofa.io:4567
IMAGE_PATH = sofachat/web/worksapce-11.1.1
DOCKER_IMAGE ?= $(CONTAINER_REGISTRY)/$(IMAGE_PATH)
DOCKER_IMAGE_TAR = $(CONTAINER_REGISTRY)_$(IMAGE_PATH)_$(VERSION).tar
DOCKER_IMAGE_DIR = docker_imgs
VERSION ?= test

DOCKER_COMPOSE_FILE = docker-compose.yml
DOCKERFILE = Dockerfile
ENV_FILE_EXA ?= .env.example
ENV_FILE ?= .env

GIT_REMOTE ?= origin

# Force a specific shell
SHELL := /bin/sh


# OS-specific settings (e.g., sed syntax differences)
SED_CMD = sed -i
RM_CMD = rm -rf $(DOCKER_IMAGE_DIR)
MKDIR_CMD = mkdir -p $(DOCKER_IMAGE_DIR)
DOCKER_LOAD_CMD =  docker load --input ./$(DOCKER_IMAGE_DIR)/$(DOCKER_IMAGE_TAR)
DOCKER_DOWN_CMD =  docker compose -f $(DOCKER_COMPOSE_FILE) down
DOCKER_UP_CMD =  docker compose -f $(DOCKER_COMPOSE_FILE) up -d
DOCKER_PULL_CMD =  docker pull $(DOCKER_IMAGE):$(VERSION)

.PHONY: check-version
check-version:
ifndef VERSION
        $(error VERSION is not set. Provide it using 'make docker-build VERSION=<version>')
endif

.PHONY: setup_dotenv
setup_dotenv:
	@echo "Copying .env.example to .env"
	cp $(ENV_FILE_EXA) $(ENV_FILE)

	@echo "Updating .env file with the new image and version"
	$(SED_CMD) "s|^VERSION=.*|VERSION=$(VERSION)|" $(ENV_FILE)

.PHONY: publish_git_tag
publish_git_tag:
	@GIT_LAST_COMMIT=$$(git log -1 --pretty=%B); \
	echo "Last Commit Message: $$GIT_LAST_COMMIT"; \
	git tag -a -f v$(VERSION) -m "$$GIT_LAST_COMMIT"
	git push $(GIT_REMOTE) v$(VERSION) --force


# Targets
.PHONY: build
build: check-version
	@echo "Pulll latest as cache"
	docker pull ${DOCKER_IMAGE}:latest || true
	@echo "Building Docker image for OS: $(OS)"
	docker build \
		--build-arg BUILDKIT_INLINE_CACHE=1 \
		--cache-from $(DOCKER_IMAGE):latest \
		-f $(DOCKERFILE) \
		-t $(DOCKER_IMAGE):latest \
		-t $(DOCKER_IMAGE):$(VERSION) \
		.


.PHONY: up
up: check-version
	@echo "Bringing up"
	$(DOCKER_UP_CMD)

.PHONY: down
down: check-version
	@echo "Bringing down"
	$(DOCKER_DOWN_CMD)

.PHONY: run
run: check-version
	$(MAKE) setup_dotenv
	@echo "Bringing up services with updated Docker Compose"
	$(MAKE) up
		

.PHONY: deploy
deploy: check-version
	@echo "pull image $(DOCKER_IMAGE):$(VERSION)"
	$(DOCKER_PULL_CMD)

	# @echo "load image $(DOCKER_IMAGE_TAR) on $(OS)"
	# $(DOCKER_LOAD_CMD)
	
	$(MAKE) down
	$(MAKE) up
		
.PHONY: push
push: check-version
	docker push $(DOCKER_IMAGE):$(VERSION)
# 	$(MAKE) publish_git_tag
# 	$(MKDIR_CMD)
# 	docker save -o ./$(DOCKER_IMAGE_DIR)/$(DOCKER_IMAGE_TAR) $(DOCKER_IMAGE):$(VERSION)
# 	scp ./$(DOCKER_IMAGE_DIR)/$(DOCKER_IMAGE_TAR) xx@x.x.x.x:/home/$(DOCKER_IMAGE_DIR)


.PHONY: clean
clean: check-version
	$(MAKE) down
	docker image rm $(DOCKER_IMAGE):$(VERSION)

.PHONY: prune
prune: check-version
	$(RM_CMD) 
	docker system prune -a --volumes -f

