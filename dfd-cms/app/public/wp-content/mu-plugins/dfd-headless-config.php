<?php
/**
 * Plugin Name: DFD Headless CMS Configuration
 * Description: Configures WordPress for headless CMS operation with GraphQL
 * Version: 1.0.0
 * Author: Dean Forant
 * 
 * This must-use plugin automatically configures WordPress for headless operation.
 */

// Prevent direct access
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Register Custom Post Types
 */
function dfd_register_custom_post_types() {
    // Register Portfolio Post Type
    register_post_type( 'portfolio', array(
        'labels' => array(
            'name'               => 'Portfolio',
            'singular_name'      => 'Portfolio Item',
            'add_new'            => 'Add New',
            'add_new_item'       => 'Add New Portfolio Item',
            'edit_item'          => 'Edit Portfolio Item',
            'new_item'           => 'New Portfolio Item',
            'view_item'          => 'View Portfolio Item',
            'search_items'       => 'Search Portfolio',
            'not_found'          => 'No portfolio items found',
            'not_found_in_trash' => 'No portfolio items found in trash',
        ),
        'public'              => true,
        'has_archive'         => true,
        'show_in_rest'        => true,
        'rest_base'           => 'portfolio',
        'show_in_graphql'     => true,
        'graphql_single_name' => 'portfolio',
        'graphql_plural_name' => 'portfolios',
        'menu_icon'           => 'dashicons-portfolio',
        'supports'            => array( 'title', 'editor', 'thumbnail', 'excerpt' ),
        'rewrite'             => array( 'slug' => 'portfolio' ),
    ) );

    // Register Services Post Type
    register_post_type( 'service', array(
        'labels' => array(
            'name'               => 'Services',
            'singular_name'      => 'Service',
            'add_new'            => 'Add New',
            'add_new_item'       => 'Add New Service',
            'edit_item'          => 'Edit Service',
            'new_item'           => 'New Service',
            'view_item'          => 'View Service',
            'search_items'       => 'Search Services',
            'not_found'          => 'No services found',
            'not_found_in_trash' => 'No services found in trash',
        ),
        'public'              => true,
        'has_archive'         => true,
        'show_in_rest'        => true,
        'rest_base'           => 'services',
        'show_in_graphql'     => true,
        'graphql_single_name' => 'service',
        'graphql_plural_name' => 'services',
        'menu_icon'           => 'dashicons-admin-tools',
        'supports'            => array( 'title', 'editor', 'thumbnail' ),
        'rewrite'             => array( 'slug' => 'services' ),
    ) );
}
add_action( 'init', 'dfd_register_custom_post_types' );

/**
 * Add CORS headers for GraphQL endpoint
 */
function dfd_add_cors_headers() {
    // Only add CORS headers for GraphQL requests
    if ( isset( $_SERVER['REQUEST_URI'] ) && strpos( $_SERVER['REQUEST_URI'], '/graphql' ) !== false ) {
        // Allow requests from any origin (adjust in production)
        header( 'Access-Control-Allow-Origin: *' );
        header( 'Access-Control-Allow-Methods: GET, POST, OPTIONS' );
        header( 'Access-Control-Allow-Headers: Content-Type, Authorization' );
        header( 'Access-Control-Allow-Credentials: true' );
        
        // Handle preflight OPTIONS request
        if ( $_SERVER['REQUEST_METHOD'] === 'OPTIONS' ) {
            status_header( 200 );
            exit;
        }
    }
}
add_action( 'init', 'dfd_add_cors_headers', 1 );

/**
 * Disable unnecessary WordPress features for headless mode
 */
function dfd_disable_unnecessary_features() {
    // Disable XML-RPC
    add_filter( 'xmlrpc_enabled', '__return_false' );
    
    // Disable default REST API routes (keep only GraphQL)
    // Uncomment if you want to completely disable REST API
    // add_filter( 'rest_authentication_errors', function() {
    //     return new WP_Error( 'rest_disabled', 'REST API is disabled', array( 'status' => 403 ) );
    // });
}
add_action( 'init', 'dfd_disable_unnecessary_features' );

/**
 * Customize GraphQL schema
 */
function dfd_customize_graphql() {
    // Add custom fields to GraphQL schema if needed
    // This can be extended based on requirements
}
add_action( 'graphql_register_types', 'dfd_customize_graphql' );

/**
 * Flush rewrite rules on plugin activation
 * This is a must-use plugin, so we use a different approach
 */
function dfd_flush_rewrites() {
    $flag = get_option( 'dfd_flush_rewrites_flag' );
    if ( ! $flag ) {
        flush_rewrite_rules();
        update_option( 'dfd_flush_rewrites_flag', true );
    }
}
add_action( 'init', 'dfd_flush_rewrites', 999 );

/**
 * Add GraphQL support message to admin dashboard
 */
function dfd_admin_notice() {
    $screen = get_current_screen();
    if ( $screen->id === 'dashboard' ) {
        ?>
        <div class="notice notice-info">
            <p><strong>DFD Headless CMS:</strong> GraphQL API is active at <code><?php echo home_url( '/graphql' ); ?></code></p>
            <p>Use the GraphiQL IDE to test queries: <a href="<?php echo admin_url( 'admin.php?page=graphiql-ide' ); ?>">GraphiQL IDE</a></p>
        </div>
        <?php
    }
}
add_action( 'admin_notices', 'dfd_admin_notice' );

/**
 * Customize WordPress admin for headless operation
 */
function dfd_customize_admin() {
    // Remove unnecessary menu items for headless CMS
    remove_menu_page( 'edit-comments.php' ); // Comments
    
    // You can add more customizations here
}
add_action( 'admin_menu', 'dfd_customize_admin', 999 );

/**
 * Security enhancements
 */
function dfd_security_enhancements() {
    // Remove WordPress version from headers
    remove_action( 'wp_head', 'wp_generator' );
    
    // Disable file editing in WordPress admin
    if ( ! defined( 'DISALLOW_FILE_EDIT' ) ) {
        define( 'DISALLOW_FILE_EDIT', true );
    }
}
add_action( 'init', 'dfd_security_enhancements' );
