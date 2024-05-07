
if [ "$1" = "log" ]; then
    docker container logs -f --tail 100 cm-$2

else
    docker exec -it cm-$1 sh

fi
