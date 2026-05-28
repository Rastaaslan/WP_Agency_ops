<?php
/**
 * Plugin Name: WP Agency Ops Companion
 * Description: Read-only companion API for WP Agency Ops Toolkit.
 * Version: 0.1.0
 * Author: WP Agency Ops Toolkit
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * Text Domain: wp-agency-ops-companion
 */

defined('ABSPATH') || exit;

final class WP_Agency_Ops_Companion {
    private const OPTION_KEY = 'wp_agency_ops_api_key';
    private const REST_NAMESPACE = 'wp-agency-ops/v1';

    public static function activate(): void {
        if (!get_option(self::OPTION_KEY)) {
            update_option(self::OPTION_KEY, wp_generate_password(40, false, false), false);
        }
    }

    public function boot(): void {
        add_action('rest_api_init', [$this, 'register_routes']);
        add_action('admin_menu', [$this, 'register_admin_page']);
        add_action('admin_post_wp_agency_ops_regenerate_key', [$this, 'regenerate_key']);
    }

    public function register_routes(): void {
        register_rest_route(self::REST_NAMESPACE, '/health', [
            'methods' => WP_REST_Server::READABLE,
            'callback' => [$this, 'get_health'],
            'permission_callback' => [$this, 'authorize_request'],
        ]);

        register_rest_route(self::REST_NAMESPACE, '/plugins', [
            'methods' => WP_REST_Server::READABLE,
            'callback' => [$this, 'get_plugins'],
            'permission_callback' => [$this, 'authorize_request'],
        ]);

        register_rest_route(self::REST_NAMESPACE, '/themes', [
            'methods' => WP_REST_Server::READABLE,
            'callback' => [$this, 'get_themes'],
            'permission_callback' => [$this, 'authorize_request'],
        ]);

        register_rest_route(self::REST_NAMESPACE, '/updates', [
            'methods' => WP_REST_Server::READABLE,
            'callback' => [$this, 'get_updates'],
            'permission_callback' => [$this, 'authorize_request'],
        ]);
    }

    public function authorize_request(WP_REST_Request $request) {
        $expected = (string) get_option(self::OPTION_KEY, '');
        $provided = (string) $request->get_header('x-wp-agency-ops-key');

        if (!$provided) {
            $provided = (string) $request->get_header('x_wp_agency_ops_key');
        }

        if (!$expected || !$provided || !hash_equals($expected, $provided)) {
            return new WP_Error(
                'wp_agency_ops_unauthorized',
                'Invalid WP Agency Ops API key.',
                ['status' => 401]
            );
        }

        return true;
    }

    public function get_health(): WP_REST_Response {
        global $wp_version;

        $active_theme = wp_get_theme();

        return new WP_REST_Response([
            'detected' => true,
            'siteUrl' => site_url(),
            'homeUrl' => home_url(),
            'wpVersion' => $wp_version,
            'phpVersion' => PHP_VERSION,
            'isMultisite' => is_multisite(),
            'debugEnabled' => defined('WP_DEBUG') && WP_DEBUG,
            'locale' => get_locale(),
            'activeTheme' => [
                'name' => $active_theme->get('Name'),
                'slug' => $active_theme->get_stylesheet(),
                'version' => $active_theme->get('Version'),
            ],
        ]);
    }

    public function get_plugins(): WP_REST_Response {
        require_once ABSPATH . 'wp-admin/includes/plugin.php';

        $plugin_updates = get_site_transient('update_plugins');
        $plugins = [];

        foreach (get_plugins() as $plugin_file => $plugin_data) {
            $update = $plugin_updates->response[$plugin_file] ?? null;
            $slug = dirname($plugin_file);

            if ($slug === '.') {
                $slug = basename($plugin_file, '.php');
            }

            $plugins[] = [
                'name' => $plugin_data['Name'] ?? $plugin_file,
                'slug' => $slug,
                'version' => $plugin_data['Version'] ?? null,
                'active' => is_plugin_active($plugin_file),
                'updateAvailable' => (bool) $update,
                'newVersion' => $update->new_version ?? null,
                'requiresWp' => $plugin_data['RequiresWP'] ?? null,
                'requiresPhp' => $plugin_data['RequiresPHP'] ?? null,
                'testedUpTo' => $plugin_data['TestedUpTo'] ?? null,
                'status' => $update ? 'update_available' : 'healthy',
            ];
        }

        return new WP_REST_Response($plugins);
    }

    public function get_themes(): WP_REST_Response {
        $theme_updates = get_site_transient('update_themes');
        $active_stylesheet = wp_get_theme()->get_stylesheet();
        $themes = [];

        foreach (wp_get_themes() as $stylesheet => $theme) {
            $update = $theme_updates->response[$stylesheet] ?? null;

            $themes[] = [
                'name' => $theme->get('Name'),
                'slug' => $stylesheet,
                'version' => $theme->get('Version'),
                'active' => $stylesheet === $active_stylesheet,
                'updateAvailable' => (bool) $update,
                'newVersion' => $update['new_version'] ?? null,
                'status' => $update ? 'update_available' : 'healthy',
            ];
        }

        return new WP_REST_Response($themes);
    }

    public function get_updates(): WP_REST_Response {
        $core_updates = get_site_transient('update_core');
        $plugin_updates = get_site_transient('update_plugins');
        $theme_updates = get_site_transient('update_themes');

        return new WP_REST_Response([
            'core' => $core_updates->updates ?? [],
            'plugins' => $plugin_updates->response ?? [],
            'themes' => $theme_updates->response ?? [],
        ]);
    }

    public function register_admin_page(): void {
        add_management_page(
            'WP Agency Ops',
            'WP Agency Ops',
            'manage_options',
            'wp-agency-ops',
            [$this, 'render_admin_page']
        );
    }

    public function render_admin_page(): void {
        if (!current_user_can('manage_options')) {
            wp_die(esc_html__('You do not have permission to access this page.', 'wp-agency-ops-companion'));
        }

        $api_key = (string) get_option(self::OPTION_KEY, '');
        ?>
        <div class="wrap">
            <h1>WP Agency Ops Companion</h1>
            <p>This plugin exposes read-only WordPress technical data to WP Agency Ops Toolkit.</p>
            <table class="form-table" role="presentation">
                <tr>
                    <th scope="row">API key</th>
                    <td>
                        <input type="text" class="regular-text code" readonly value="<?php echo esc_attr($api_key); ?>" />
                        <p class="description">Send this value in the <code>X-WP-Agency-Ops-Key</code> header.</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">Endpoints</th>
                    <td>
                        <code><?php echo esc_url_raw(rest_url(self::REST_NAMESPACE . '/health')); ?></code><br />
                        <code><?php echo esc_url_raw(rest_url(self::REST_NAMESPACE . '/plugins')); ?></code><br />
                        <code><?php echo esc_url_raw(rest_url(self::REST_NAMESPACE . '/themes')); ?></code><br />
                        <code><?php echo esc_url_raw(rest_url(self::REST_NAMESPACE . '/updates')); ?></code>
                    </td>
                </tr>
            </table>
            <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>">
                <input type="hidden" name="action" value="wp_agency_ops_regenerate_key" />
                <?php wp_nonce_field('wp_agency_ops_regenerate_key'); ?>
                <?php submit_button('Regenerate API key', 'secondary'); ?>
            </form>
        </div>
        <?php
    }

    public function regenerate_key(): void {
        if (!current_user_can('manage_options')) {
            wp_die(esc_html__('You do not have permission to regenerate this key.', 'wp-agency-ops-companion'));
        }

        check_admin_referer('wp_agency_ops_regenerate_key');
        update_option(self::OPTION_KEY, wp_generate_password(40, false, false), false);

        wp_safe_redirect(admin_url('tools.php?page=wp-agency-ops&updated=1'));
        exit;
    }
}

register_activation_hook(__FILE__, ['WP_Agency_Ops_Companion', 'activate']);

(new WP_Agency_Ops_Companion())->boot();
