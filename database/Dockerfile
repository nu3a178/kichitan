FROM postgres:14
RUN apt-get update \
  && apt-get install -y postgis postgresql-14-postgis-3 \
  && rm -rf /var/lib/apt/lists/*
