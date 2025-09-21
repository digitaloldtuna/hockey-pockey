# Deployment Checklist

## Pre-Deployment

- [ ] Update `SECRET_KEY` in production settings
- [ ] Set `DEBUG=False` in production
- [ ] Configure `ALLOWED_HOSTS` with your domain
- [ ] Set up PostgreSQL database in cPanel
- [ ] Create `.env` file with production values
- [ ] Test build locally with `./deploy-scripts/build.sh`

## cPanel Setup

- [ ] Enable Python App in cPanel
- [ ] Create Python app (version 3.10+)
- [ ] Create PostgreSQL database
- [ ] Set up database user and permissions
- [ ] Upload project files to `public_html/hockey-pockey/`

## Deployment

- [ ] Run `./deploy-scripts/setup-cpanel.sh`
- [ ] Run `./deploy-scripts/deploy.sh`
- [ ] Verify static files are collected
- [ ] Run database migrations
- [ ] Test API endpoints
- [ ] Test React frontend

## Post-Deployment

- [ ] Configure domain/subdomain
- [ ] Set up SSL certificate
- [ ] Test all functionality
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Update DNS if needed

## Verification

- [ ] Frontend loads correctly
- [ ] API endpoints respond
- [ ] Database operations work
- [ ] Static files load
- [ ] CORS is configured properly
- [ ] No console errors
- [ ] Mobile responsive

## Security

- [ ] HTTPS is enabled
- [ ] Secret key is secure
- [ ] Database credentials are secure
- [ ] CORS origins are restricted
- [ ] Debug mode is disabled
- [ ] Error pages don't expose sensitive info
