FROM alpine:latest

RUN apk add --no-cache \
    bash \
    curl \
    openssl \
    ca-certificates

WORKDIR /install

COPY install.sh /usr/local/bin/install.sh

RUN chmod +x /usr/local/bin/install.sh

ENTRYPOINT ["/bin/bash", "/usr/local/bin/install.sh"]
