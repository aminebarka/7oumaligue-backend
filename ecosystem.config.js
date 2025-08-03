module.exports = {
  apps: [
    {
      name: '7oumaligue-backend',
      script: 'dist/server.js',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 5000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      // Redémarrage automatique en cas d'erreur
      max_restarts: 10,
      min_uptime: '10s',
      // Surveillance de la mémoire et CPU
      node_args: '--max-old-space-size=1024',
      // Variables d'environnement pour la base de données
      env_file: '.env'
    }
  ]
}; 