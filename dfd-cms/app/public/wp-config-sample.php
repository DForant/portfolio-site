<?php
/**
 * WordPress Configuration for Headless CMS
 * 
 * This file contains the base configuration for WordPress as a headless CMS.
 * Copy this file to wp-config.php and update the values as needed.
 * 
 * @package DFD-CMS
 */

// ** Database Settings ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'database_name_here' );

/** Database username */
define( 'DB_USER', 'username_here' );

/** Database password */
define( 'DB_PASSWORD', 'password_here' );

/** Database hostname */
define( 'DB_HOST', 'localhost' );

/** Database charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8mb4' );

/** The database collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**
 * Authentication Unique Keys and Salts.
 * 
 * Change these to different unique phrases! You can generate these using
 * the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}.
 * 
 * You can change these at any point in time to invalidate all existing cookies.
 * This will force all users to have to log in again.
 */
define( 'AUTH_KEY',         'put your unique phrase here' );
define( 'SECURE_AUTH_KEY',  'put your unique phrase here' );
define( 'LOGGED_IN_KEY',    'put your unique phrase here' );
define( 'NONCE_KEY',        'put your unique phrase here' );
define( 'AUTH_SALT',        'put your unique phrase here' );
define( 'SECURE_AUTH_SALT', 'put your unique phrase here' );
define( 'LOGGED_IN_SALT',   'put your unique phrase here' );
define( 'NONCE_SALT',       'put your unique phrase here' );

/**
 * WordPress Database Table prefix.
 */
$table_prefix = 'wp_';

/**
 * For developers: WordPress debugging mode.
 * 
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 */
define( 'WP_DEBUG', false );

/**
 * Headless CMS Configuration
 * 
 * Disable the WordPress frontend and focus on the admin and API.
 */
// Disable WordPress theme frontend
define( 'WP_USE_THEMES', false );

// Enable GraphQL Debug Mode (set to false in production)
define( 'GRAPHQL_DEBUG', true );

// Enable Application Passwords (WordPress 5.6+)
define( 'APPLICATION_PASSWORD_AUTH', true );

/**
 * WordPress Paths
 * 
 * These paths are configured for composer-based WordPress installation.
 */
define( 'WP_CONTENT_DIR', dirname( __FILE__ ) . '/wp-content' );
define( 'WP_CONTENT_URL', 'http://' . $_SERVER['HTTP_HOST'] . '/wp-content' );

// Set WordPress installation directory
if ( ! defined( 'ABSPATH' ) ) {
    define( 'ABSPATH', dirname( __FILE__ ) . '/wp/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
