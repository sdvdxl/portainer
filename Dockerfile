FROM registry:2

# portainer
COPY dist /
COPY start.sh /

VOLUME ["/var/lib/registry", "/data"]

WORKDIR /

# Docker registry
EXPOSE 5000
EXPOSE 9000
EXPOSE 8000

ENTRYPOINT ["/start.sh"]
