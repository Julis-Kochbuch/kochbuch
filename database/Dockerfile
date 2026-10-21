FROM postgres:18

COPY ./init/ /docker-entrypoint-initdb.d/

RUN chmod +x /docker-entrypoint-initdb.d/*.sh

HEALTHCHECK --interval=120s \
            --timeout=3s \
            --start-period=60s \
    CMD-SHELL 'pg_isready -h 127.0.0.1 -U "$$POSTGRES_USER" -d "$$POSTGRES_DB"'