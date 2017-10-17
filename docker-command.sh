#!/bin/sh

sed -i s#__GITLAB_GOODIES_API_URL__#${GITLAB_GOODIES_API_URL}#g  /usr/share/nginx/html/main.*.js &&\
sed -i s#__GITLAB_GOODIES_API_KEY__#${GITLAB_GOODIES_API_KEY}#g  /usr/share/nginx/html/main.*.js &&\
echo "varibles set. Starting server ..."  && nginx -g "daemon off;"
