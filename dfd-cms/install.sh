#!/bin/bash

# WordPress Headless CMS Installation Script
# This script automates the installation of WordPress and required plugins

set -e

echo "======================================"
echo "DFD WordPress Headless CMS Installer"
echo "======================================"
echo ""

# Check if composer is installed
if ! command -v composer &> /dev/null; then
    echo "❌ Error: Composer is not installed."
    echo "Please install Composer from https://getcomposer.org/"
    exit 1
fi

echo "✓ Composer found"

# Navigate to the WordPress directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WP_DIR="$SCRIPT_DIR/app/public"

if [ ! -d "$WP_DIR" ]; then
    echo "❌ Error: WordPress directory not found at $WP_DIR"
    exit 1
fi

cd "$WP_DIR"
echo "✓ Changed to WordPress directory: $WP_DIR"
echo ""

# Install WordPress and plugins via Composer
echo "Installing WordPress and plugins via Composer..."
echo "This may take a few minutes..."
echo ""

composer install

echo ""
echo "✓ WordPress and plugins installed successfully!"
echo ""

# Check if wp-config.php exists
if [ ! -f "wp-config.php" ]; then
    echo "⚠️  wp-config.php not found"
    echo "Creating wp-config.php from template..."
    
    if [ -f "wp-config-sample.php" ]; then
        cp wp-config-sample.php wp-config.php
        echo "✓ wp-config.php created from template"
        echo ""
        echo "📝 IMPORTANT: Edit wp-config.php and update:"
        echo "   - Database credentials (DB_NAME, DB_USER, DB_PASSWORD, DB_HOST)"
        echo "   - Authentication keys and salts (generate at https://api.wordpress.org/secret-key/1.1/salt/)"
        echo "   - WP_CONTENT_URL to match your domain"
    else
        echo "❌ Error: wp-config-sample.php not found"
        exit 1
    fi
else
    echo "✓ wp-config.php already exists"
fi

echo ""
echo "======================================"
echo "Installation Complete!"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. Create a MySQL database for WordPress"
echo "2. Edit wp-config.php with your database credentials"
echo "3. Navigate to your WordPress admin: /wp/wp-admin/"
echo "4. Complete the WordPress installation wizard"
echo "5. Activate the required plugins:"
echo "   - WPGraphQL"
echo "   - Advanced Custom Fields"
echo "   - WPGraphQL for Advanced Custom Fields"
echo "6. GraphQL endpoint will be at: /graphql"
echo ""
echo "For detailed instructions, see: dfd-cms/README.md"
echo ""
