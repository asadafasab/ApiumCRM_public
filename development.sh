export $(grep -v '^#' .env | xargs)
export $(grep -v '^#' .env_dev | xargs)
# env $(grep -v '^#' ../.env_dev | xargs) podman run -itd -e POSTGRES_USER=$POSTGRES_USER -e POSTGRES_PASSWORD=$POSTGRES_PASSWORD -p 5432:5432 --name db postgres
# chromium-browser -disable-web-security --disable-gpu --disable-features=IsolateOrigins,site-per-process --user-data-dir='/home/asadafasab/.config/chromiumdev' --disable-features=IsolateOrigins,site-per-process &

podman run -itd -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -v data:/var/lib/postgresql/data --name db postgres
podman start db
source .env_dev
cd frontend
npm install
#npm start &
# sleep 2

cd ../backend/
env $(grep -v '^#' ../.env_dev | xargs) python manage.py collectstatic --noinput
env $(grep -v '^#' ../.env_dev | xargs) python manage.py migrate --noinput

cat <<EOF | python manage.py shell
from django.contrib.auth import get_user_model

User = get_user_model()  # get the currently active user model,

User.objects.filter(username='root').exists() or \
    User.objects.create_superuser('root', 'root@root.root', 'root')
EOF

#env $(grep -v '^#' ../.env_dev | xargs)
python manage.py runserver 0.0.0.0:8000
