# DFD CMS - WordPress Headless CMS Setup

This directory contains the WordPress installation configured as a headless CMS for the Dean Forant Portfolio website.

## Overview

The WordPress installation is managed via Composer and configured to expose content through GraphQL API using WPGraphQL.

## Prerequisites

- PHP 7.4 or higher
- Composer installed
- MySQL or MariaDB database
- Web server (Apache/Nginx) with PHP support

## Installed Plugins

The following plugins are automatically installed via Composer:

1. **WPGraphQL** - Enables GraphQL API for WordPress
2. **Advanced Custom Fields (ACF)** - Create custom fields for portfolio items and services
3. **WPGraphQL for ACF** - Exposes ACF fields through the GraphQL API
4. **Wordfence** - Security plugin to protect the WordPress installation
5. **Application Passwords** - Built-in WordPress feature for secure API authentication

## Installation Steps

### 1. Install Dependencies

From the `dfd-cms/app/public` directory, run:

```bash
composer install
```

This will:
- Install WordPress core in the `wp/` directory
- Install all required plugins in `wp-content/plugins/`
- Set up the proper directory structure

### 2. Create Database

Create a MySQL/MariaDB database for WordPress:

```sql
CREATE DATABASE dfd_cms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'dfd_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON dfd_cms.* TO 'dfd_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Configure WordPress

1. Copy the sample configuration file:
   ```bash
   cp wp-config-sample.php wp-config.php
   ```

2. Edit `wp-config.php` and update:
   - Database credentials (DB_NAME, DB_USER, DB_PASSWORD, DB_HOST)
   - Authentication keys and salts (generate at https://api.wordpress.org/secret-key/1.1/salt/)
   - Set WP_DEBUG to false in production

3. Update the WP_CONTENT_URL to match your domain:
   ```php
   define( 'WP_CONTENT_URL', 'https://yourdomain.com/wp-content' );
   ```

### 4. Configure Web Server

#### Apache

Create or update `.htaccess` file:

```apache
# BEGIN WordPress
<IfModule mod_rewrite.c>
RewriteEngine On
RewriteBase /
RewriteRule ^index\.php$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.php [L]
</IfModule>
# END WordPress
```

#### Nginx

Add to your server block:

```nginx
location / {
    try_files $uri $uri/ /index.php?$args;
}

location ~ \.php$ {
    include fastcgi_params;
    fastcgi_pass unix:/var/run/php/php7.4-fpm.sock;
    fastcgi_index index.php;
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
}
```

### 5. Complete WordPress Installation

1. Navigate to your WordPress admin URL: `https://yourdomain.com/wp/wp-admin/`
2. Complete the WordPress installation wizard
3. Create an admin account

### 6. Activate Plugins

After installation, activate the required plugins:

1. Log in to WordPress admin
2. Go to **Plugins** → **Installed Plugins**
3. Activate the following plugins:
   - WPGraphQL
   - Advanced Custom Fields
   - WPGraphQL for Advanced Custom Fields
   - Wordfence (optional but recommended)

### 7. Configure GraphQL

1. Go to **GraphQL** → **Settings** in the WordPress admin
2. Enable GraphQL Debug Mode (for development only)
3. Note your GraphQL endpoint: `https://yourdomain.com/graphql`
4. See [GRAPHQL_EXAMPLES.md](GRAPHQL_EXAMPLES.md) for example queries and frontend integration

### 8. Set Up Custom Post Types

Create custom post types for Portfolio and Services:

1. Go to **Plugins** → **Add New**
2. Search for "Custom Post Type UI" and install (or add to composer.json)
3. Create post types:
   - **Portfolio** (slug: `portfolio`)
   - **Services** (slug: `services`)
4. Make sure both are set to "Show in GraphQL" with appropriate GraphQL single and plural names

### 9. Configure ACF Fields

#### Portfolio Fields

1. Go to **ACF** → **Field Groups** → **Add New**
2. Create a field group for Portfolio:
   - Project Description (Textarea)
   - Project Image (Image)
   - Project URL (URL)
   - Behance Embed Code (Textarea)
3. Set location rule: Post Type is equal to Portfolio
4. Enable "Show in GraphQL"

#### Services Fields

1. Create another field group for Services:
   - Service Description (Textarea)
   - Service Icon (Text) - for Font Awesome class name
2. Set location rule: Post Type is equal to Services
3. Enable "Show in GraphQL"

### 10. Test GraphQL API

1. Navigate to GraphiQL IDE: `https://yourdomain.com/wp-admin/admin.php?page=graphiql-ide`
2. Try a test query:

```graphql
query {
  portfolios {
    nodes {
      title
      id
      portfolioFields {
        projectDescription
        projectUrl
        behanceEmbedCode
      }
    }
  }
}
```

## Security Configuration

### Application Passwords

1. Go to **Users** → **Profile**
2. Scroll to "Application Passwords"
3. Create a new application password for API access
4. Store this password securely - it will be used by the frontend to authenticate GraphQL requests

### Wordfence Configuration

1. Complete the Wordfence setup wizard
2. Enable two-factor authentication for admin users
3. Configure firewall rules as needed
4. Set up email alerts for security events

### Disable REST API (Optional)

To enhance security, you can limit REST API access:

1. Install "Disable REST API" plugin or add to composer.json:
   ```json
   "wpackagist-plugin/disable-json-api": "^1.0"
   ```
2. This will force all API requests to use GraphQL only

## Environment Variables for Frontend

Add these to your frontend `.env` file:

```env
WP_GRAPHQL_URL=https://yourdomain.com/graphql
WP_APP_PASSWORD=your_application_password_here
WP_API_USER=admin_username
```

## Maintenance

### Updating WordPress and Plugins

To update WordPress core and plugins:

```bash
cd dfd-cms/app/public
composer update
```

### Backup

Regularly backup:
1. Database (MySQL dump)
2. `wp-content/uploads/` directory (media files)
3. `wp-config.php` file
4. Custom themes and plugins (if any)

## Troubleshooting

### GraphQL endpoint returns 404

- Check that WPGraphQL plugin is activated
- Flush permalinks: Settings → Permalinks → Save Changes

### ACF fields not showing in GraphQL

- Make sure "Show in GraphQL" is enabled for the field group
- Check that the GraphQL field name is set correctly
- Clear any caching plugins

### Authentication errors

- Verify Application Password is correct
- Check that `APPLICATION_PASSWORD_AUTH` is true in wp-config.php
- Ensure WordPress version is 5.6 or higher

## Directory Structure

```
dfd-cms/app/public/
├── composer.json           # Composer dependencies
├── composer.lock          # Locked versions
├── wp-config-sample.php   # Sample configuration
├── wp-config.php          # WordPress configuration (gitignored)
├── wp/                    # WordPress core (gitignored)
├── wp-content/            # WordPress content
│   ├── plugins/           # Plugins (gitignored, managed by Composer)
│   ├── themes/            # Custom themes (tracked in git)
│   ├── mu-plugins/        # Must-use plugins (tracked in git)
│   └── uploads/           # Media files (gitignored)
└── vendor/                # Composer vendor directory (gitignored)
```

## Additional Resources

- [WPGraphQL Documentation](https://www.wpgraphql.com/docs/introduction)
- [Advanced Custom Fields Documentation](https://www.advancedcustomfields.com/resources/)
- [WordPress Codex](https://codex.wordpress.org/)
- [Composer for WordPress](https://roots.io/using-composer-with-wordpress/)
- [GraphQL Query Examples](GRAPHQL_EXAMPLES.md) - Example queries for frontend integration

## Support

For issues with the WordPress setup, check:
1. WordPress error logs
2. PHP error logs
3. GraphQL debug messages (when WP_DEBUG is enabled)
4. Browser console for frontend errors
