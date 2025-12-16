# Production Deployment Checklist

Use this checklist before deploying to production environments.

## Pre-Deployment

### Infrastructure

- [ ] Docker host has minimum 8GB RAM allocated
- [ ] SSD storage with at least 50GB available
- [ ] Ports 3000, 8080 are available (or configured differently)
- [ ] Firewall rules configured to allow necessary traffic
- [ ] SSL/TLS certificates obtained (for HTTPS)
- [ ] Domain names configured and pointing to server

### Security

- [ ] Changed all default passwords
  - [ ] PostgreSQL: `POSTGRES_PASSWORD` in `.env`
  - [ ] MinIO: `MINIO_ROOT_USER` and `MINIO_ROOT_PASSWORD`
  - [ ] Redis: `redis.conf` password configured
- [ ] AWS credentials stored securely (not in git)
  - [ ] Use AWS Secrets Manager or environment variables
  - [ ] IAM role with minimum required permissions
- [ ] Environment variables reviewed and secured
  - [ ] No sensitive data in git repository
  - [ ] `.env` file excluded from version control
- [ ] CORS origins restricted to production domains only
- [ ] Rate limiting configured on API endpoints
- [ ] Content Security Policy (CSP) headers configured
- [ ] HTTPS enforced (redirect HTTP → HTTPS)

### Configuration

- [ ] `.env` file created from `.env.template`
- [ ] `ENVIRONMENT=production` set
- [ ] Database connection string configured for production
- [ ] AWS credentials configured (if using real AI)
- [ ] S3 bucket names configured correctly
- [ ] Backup schedule configured
- [ ] Log retention policy set
- [ ] Resource limits set in `docker-compose.prod.yml`

### Testing

- [ ] All unit tests passing (`pnpm test`)
- [ ] Integration tests passing
- [ ] E2E tests passing (`pnpm e2e`)
- [ ] Load testing completed
- [ ] Security scan completed (Trivy, Semgrep)
- [ ] Accessibility audit passing (Lighthouse, axe)
- [ ] Cross-browser testing completed

## Deployment

### Build & Start

- [ ] Pull latest code: `git pull origin main`
- [ ] Review changes: `git log -5 --oneline`
- [ ] Build fresh images: `docker-compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache`
- [ ] Start services: `./start.sh -e production -d`
- [ ] Wait for all services to be healthy (90-120 seconds)

### Verification

#### Health Checks

- [ ] Web service healthy: `curl https://yourapp.com/api/health`
- [ ] Strands API healthy: `curl https://api.yourapp.com/api/health`
- [ ] Database accepting connections
- [ ] Redis responding to pings
- [ ] MinIO storage accessible

#### Functional Tests

- [ ] Can upload a document via Web UI
- [ ] Document appears in MinIO bucket
- [ ] Analysis starts successfully
- [ ] Progress updates display correctly
- [ ] Results load and display properly
- [ ] Can download/export results

#### Performance

- [ ] Page load time \u003c 2 seconds
- [ ] API response time \u003c 500ms
- [ ] Analysis completes in expected time
- [ ] Memory usage within limits
- [ ] CPU usage within limits

#### Security

- [ ] HTTPS working (no mixed content warnings)
- [ ] Security headers present (CSP, HSTS, X-Frame-Options)
- [ ] CORS working correctly
- [ ] No sensitive data in browser console
- [ ] No error messages exposing system details

## Post-Deployment

### Monitoring

- [ ] Log aggregation configured (ELK, CloudWatch, etc.)
- [ ] Metrics dashboard accessible (Grafana, CloudWatch, etc.)
- [ ] Alerts configured for:
  - [ ] Service downtime
  - [ ] High error rates
  - [ ] Database connection failures
  - [ ] Disk space warnings
  - [ ] Memory/CPU threshold breaches
- [ ] Uptime monitoring active (Pingdom, UptimeRobot, etc.)

### Backup

- [ ] Initial backup created: `./data-manager.sh backup`
- [ ] Backup stored in secure location (S3, network storage)
- [ ] Automated backup schedule configured (cron job)
- [ ] Backup restoration tested
- [ ] Backup retention policy implemented

### Documentation

- [ ] Production URLs documented
- [ ] Access credentials documented (in secure location)
- [ ] Runbook created for common operations
- [ ] Incident response plan documented
- [ ] Team members have access to necessary documentation

### Team Handoff

- [ ] Team members trained on deployment process
- [ ] On-call rotation established
- [ ] Escalation path documented
- [ ] Support contacts shared

## Rollback Plan

If deployment fails:

1. **Stop services**:
   ```bash
   docker-compose -p proposal-prepper down
   ```

2. **Restore previous version**:
   ```bash
   git checkout \u003cprevious-stable-tag\u003e
   ./start.sh -e production -d
   ```

3. **Restore data if needed**:
   ```bash
   ./data-manager.sh restore \u003cbackup-name\u003e
   ```

4. **Verify rollback**:
   - Check health endpoints
   - Test critical functionality
   - Review logs for errors

5. **Communicate**:
   - Notify stakeholders of rollback
   - Document issue for postmortem

## Production Maintenance

### Daily

- [ ] Check monitoring dashboard
- [ ] Review error logs
- [ ] Verify backups completed successfully

### Weekly

- [ ] Review performance metrics
- [ ] Check disk space usage
- [ ] Review security alerts
- [ ] Update dependencies if needed

### Monthly

- [ ] Security updates applied
- [ ] Test backup restoration
- [ ] Review and rotate logs
- [ ] Capacity planning review

## Emergency Contacts

**Document your emergency contacts here:**

| Role | Name | Contact | Availability |
|------|------|---------|--------------|
| On-call Engineer | | | 24/7 |
| DevOps Lead | | | Business hours |
| AWS Support | | | Support ticket |
| Database Admin | | | On-call |

## Environment-Specific Notes

### Staging Environment

- URL: _________________
- Purpose: Pre-production testing
- Data: Anonymized production copy
- Refresh schedule: Weekly

### Production Environment

- URL: _________________
- Server: _________________
- Database: _________________
- Backup location: _________________

## Sign-Off

Deployment completed by: ___________________

Date: ___________________

Approved by: ___________________

Date: ___________________

---

**Need help?** See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.
