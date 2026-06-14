#!/bin/bash
set -e  # Exit immediately on any error

# 1. Install MariaDB
sudo apt-get update
sudo apt-get install -y mariadb-server

# 2. Start MariaDB
sudo service mariadb start

# 3. Import database
if [ -f "backend/config/init.sql" ]; then
    sudo mysql -u root < backend/config/init.sql
    echo "✅ Base de datos inicializada."
else
    echo "⚠️ No se encontró init.sql en backend/config/"
fi

# 4. Source nvm so it works in non-interactive shell
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 5. Install backend dependencies and create .env
cd backend || { echo "❌ No se encontró el directorio backend/"; exit 1; }
npm install

echo "Creando archivo .env..."
cat <<EOF > .env
PORT=3000
DB_HOST=localhost
DB_USER=samplevaultest
DB_PASS=samplevaultest
DB_NAME=samplevaultest
JWT_SECRET=tu_clave_secreta_super_segura
NODE_ENV=testing
EOF

echo "🚀 Configuración de entorno completada con éxito."