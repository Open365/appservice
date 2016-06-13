#!/bin/sh
CLEAN_INTERVAL=${CLEAN_INTERVAL:-"30"}

get_containers() {
	# Docker 1.9.0 added the feature of filtering by labels, which simplifies
	# the code below (at least when I committed this) to just the following
	# line:
	#     docker ps -q -a -f "status=exited" -f "label=com.eyeos.container-type=user-application"
	# If we upgrade the requirements to require at least docker 1.9 we could
	# use that line.
	docker ps -a \
		--filter="status=exited" \
		--format='{{.ID}} {{.Label "com.eyeos.container-type"}}' \
		| while read container_id container_type
		do
			if [ "$container_type" = "user-application" ]
			then
				echo "$container_id"
			fi
		done
}

while :
do
	get_containers | xargs --no-run-if-empty docker rm
	echo "Waiting for next loop $CLEAN_INTERVAL seconds"
	sleep $CLEAN_INTERVAL
done
