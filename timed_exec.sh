#! /usr/bin/bash

command=($2)

touch ".$1.log"
docker exec $1 "${command[@]}" > ".$1.log" 2>&1 &

log_size=0
diff=0

until [ $(( $(date +%s) - $(date +%s -r ".$1.log") )) -gt $3 ]; do
    diff=$(( $(wc -l < ".$1.log") - $log_size ))
    log_size=$(wc -l < ".$1.log")
    
    if (( $diff > 0 )); then
        tail -n $diff ".$1.log"
    fi
    
    sleep 1
done
