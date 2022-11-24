<?php

/**
 * Plugin Name: Copy Paste Styles
 * Plugin URI: https://github.com/Cutch/copy-paste-styles
 * Description: Copy and Paste Gutenberg Styles
 * Requires at least: 5.6
 * Requires PHP: 7.2
 * Version: 1.0.0
 * Author: Cutch
 * Author URI: https://github.com/Cutch
 * License: GPL3
 * Text Domain: copy-paste-styles
 */


/**
 * Add the javascript to the post.php page
 */
function cps_add_script($hook)
{
  if ('post.php' != $hook) {
    return;
  }

  $script_path       = 'js/copy-paste-styles.js';
  $script_asset_path = 'js/copy-paste-styles.asset.php';
  $script_asset      = file_exists($script_asset_path)
    ? require($script_asset_path)
    : array('dependencies' => array(), 'version' => filemtime($script_path));
  $script_url = plugins_url($script_path, __FILE__);
  wp_enqueue_script('script', $script_url, $script_asset['dependencies'], $script_asset['version'], true);
}
add_action('admin_enqueue_scripts', 'cps_add_script');
