
if [ "$1" = "log" ]; then
    docker compose logs -f --tail 100 $2

else
    docker exec -it cm-$1 sh

fi
