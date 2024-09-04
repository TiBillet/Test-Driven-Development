# containers and app serving, preserving data

up: traefik_check
	@echo "📦 Starting containers…"
	@docker compose up -d
	@echo "🟢 Testing containers ready!"

down:
	@echo "📦 Stopping containers…"
	@docker compose down
	@echo "🟦 Testing containers stopped."

reload: down up

serve: tibillet_check
	@echo "🦄 Starting Fedow…"
	@./timed_exec.sh fedow_django "poetry run ./manage.py runserver 0.0.0.0:8000" 10
	@echo "🦄 Starting Lespass…"
	@./timed_exec.sh lespass_django "poetry run ./manage.py runserver 0.0.0.0:8000" 10
	@echo "🦄 Starting LaBoutik…"
	@./timed_exec.sh laboutik_django "poetry run ./manage.py runserver 0.0.0.0:8000" 10
	@make -s ready_urls

# hard initialisation and reset

erase:
	@echo "📦 Stopping containers…"
	@docker compose down -v
	@echo "🟦 Testing containers stopped, volumes erased."

flush: tibillet_check
	@echo "🌊 Flushing Fedow…"
	@./timed_exec.sh fedow_django ./flush.sh 15
	@echo "🌊 Flushing Lespass…"
	@./timed_exec.sh lespass_django ./flush.sh 10
	@echo "🌊 Flushing LaBoutik…"
	@./timed_exec.sh laboutik_django ./flush.sh 15
	@make -s ready_urls

reset: erase up flush

# helpers

ready_urls:
	@echo "🟢 Federation app ready at http://fedow.tibillet.localhost/dashboard"
	@echo "🟢 Ticketing app ready at http://lespass.tibillet.localhost"
	@echo "🟢 Register app ready at http://laboutik.tibillet.localhost"

traefik_check:
	@echo "🚦 Checking for a running Traefik container…"
	@[[ $$(docker container inspect -f '{{.State.Status}}' traefik) = 'running' ]] \
		&& echo "🟢 'traefik' container ready!" \
		|| (echo "🔴 No 'traefik' container running, start your proxy first." && exit 1)

tibillet_check:
	@echo "🎟️ Checking for running TiBillet containers…"
	@[[ $$(docker container inspect -f '{{.State.Status}}' fedow_django) = 'running' ]] \
		&& echo "🟢 'fedow_django' container ready!" \
		|| (echo "🔴 No 'fedow_django' container running." && exit 1)
	@[[ $$(docker container inspect -f '{{.State.Status}}' lespass_django) = 'running' ]] \
		&& echo "🟢 'lespass_django' container ready!" \
		|| (echo "🔴 No 'lespass_django' container running." && exit 1)
	@[[ $$(docker container inspect -f '{{.State.Status}}' laboutik_django) = 'running' ]] \
		&& echo "🟢 'laboutik_django' container ready!" \
		|| (echo "🔴 No 'laboutik_django' container running." && exit 1)
