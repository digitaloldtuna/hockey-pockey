# Hockey Pockey - Deployment Guide for Hosting.com cPanel

This guide will help you deploy your React + Django application to Hosting.com cPanel hosting.

## Prerequisites

- Hosting.com cPanel account with Python support
- Git repository (GitHub recommended)
- Domain name configured in cPanel

## Quick Start

### 1. Initial cPanel Setup

1. **Log into your cPanel**
2. **Enable Python App** (if not already enabled)
3. **Create a new Python app**:
   - App name: `hockey-pockey`
   - Python version: `3.10` (or latest available)
   - App directory: `public_html/hockey-pockey`

### 2. Database Setup

1. **Create a PostgreSQL database** in cPanel:
   - Database name: `hockey_db`
   - Username: `hockey_user`
   - Password: (generate a strong password)
   - Note down these credentials

### 3. Environment Configuration

1. **Create environment file** in your project root:
   ```bash
   cp env.example .env
   ```

2. **Edit `.env` file** with your actual values:
   ```env
   DEBUG=False
   SECRET_KEY=your-secret-key-here
   ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
   DB_NAME=hockey_db
   DB_USER=hockey_user
   DB_PASSWORD=your-db-password
   DB_HOST=localhost
   DB_PORT=5432
   CORS_ALLOWED_ORIGINS=https://yourdomain.com
   ```

### 4. Deploy Using GitHub Actions (Recommended)

1. **Set up GitHub Secrets** in your repository:
   - Go to Settings → Secrets and variables → Actions
   - Add these secrets:
     - `CPANEL_HOST`: Your cPanel hostname
     - `CPANEL_USERNAME`: Your cPanel username
     - `CPANEL_PASSWORD`: Your cPanel password
     - `CPANEL_DOMAIN`: Your domain name

2. **Update the GitHub Actions workflow** (`.github/workflows/deploy.yml`):
   - Uncomment and configure the deployment step
   - Add your cPanel credentials

3. **Push to main branch** to trigger deployment

### 5. Manual Deployment

If you prefer manual deployment:

1. **Build the application locally**:
   ```bash
   ./deploy-scripts/build.sh
   ```

2. **Upload files to cPanel**:
   - Upload the `dist/` folder contents to `public_html/hockey-pockey/`
   - Upload `passenger_wsgi.py` to `public_html/`

3. **Run setup script** on cPanel:
   ```bash
   ./deploy-scripts/setup-cpanel.sh
   ```

4. **Run deployment script**:
   ```bash
   ./deploy-scripts/deploy.sh
   ```

## File Structure After Deployment

```
public_html/
├── hockey-pockey/           # Django app
│   ├── hockey/
│   ├── api/
│   ├── staticfiles/         # Collected static files
│   ├── manage.py
│   ├── requirements.txt
│   └── .env
├── passenger_wsgi.py        # WSGI entry point
└── .htaccess               # URL rewriting rules
```

## Configuration Details

### Django Settings

- **Development**: Uses `hockey.settings`
- **Production**: Uses `hockey.settings_production`
- **Static files**: Served from `staticfiles/` directory
- **Media files**: Served from `media/` directory

### React Build

- **Build output**: `client/build/` → `hockey-pockey/static/`
- **Proxy configuration**: Handled by Django in production
- **Static serving**: Handled by WhiteNoise middleware

### Database

- **Development**: SQLite (`db.sqlite3`)
- **Production**: PostgreSQL (configured in cPanel)

## Troubleshooting

### Common Issues

1. **Static files not loading**:
   - Run `python manage.py collectstatic --noinput`
   - Check file permissions (755 for directories, 644 for files)

2. **Database connection errors**:
   - Verify database credentials in `.env`
   - Check if PostgreSQL is enabled in cPanel

3. **CORS errors**:
   - Update `CORS_ALLOWED_ORIGINS` in `.env`
   - Ensure your domain is included

4. **500 Internal Server Error**:
   - Check Django logs in cPanel
   - Verify all environment variables are set
   - Run `python manage.py check --deploy`

### Logs

- **Django logs**: `~/logs/django.log`
- **cPanel error logs**: Available in cPanel → Error Logs
- **Access logs**: Available in cPanel → Raw Access Logs

## Security Considerations

1. **Change default SECRET_KEY** in production
2. **Set DEBUG=False** in production
3. **Use HTTPS** for your domain
4. **Regular security updates** for dependencies
5. **Database backups** (configure in cPanel)

## Monitoring and Maintenance

1. **Regular backups**:
   - Database backups via cPanel
   - File backups via cPanel File Manager

2. **Updates**:
   - Update dependencies regularly
   - Monitor security advisories

3. **Performance**:
   - Monitor resource usage in cPanel
   - Consider caching for better performance

## Support

- **cPanel Documentation**: [cPanel Knowledge Base](https://docs.cpanel.net/)
- **Django Deployment**: [Django Deployment Checklist](https://docs.djangoproject.com/en/stable/howto/deployment/checklist/)
- **React Build**: [Create React App Deployment](https://create-react-app.dev/docs/deployment/)

## Next Steps

1. Set up SSL certificate for HTTPS
2. Configure custom domain
3. Set up monitoring and alerts
4. Implement automated backups
5. Consider CDN for static files
