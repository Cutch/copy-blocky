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

require_once 'settings.php';


/**
 * Add the javascript to the post.php page
 */
function copy_paste_styles_add_script()
{
  global $pagenow;

  if ('post.php' != $pagenow) {
    return;
  }

  $script_path       = 'js/copy-paste-styles.js';
  $script_asset_path = 'js/copy-paste-styles.asset.php';
  $script_asset      = include($script_asset_path);
  $script_asset = $script_asset ? $script_asset
    : array('dependencies' => array(), 'version' => filemtime($script_path));
  $script_url = plugins_url($script_path, __FILE__);
  wp_enqueue_script('copy_paste_styles_script', $script_url, $script_asset['dependencies'], $script_asset['version'], true);
}
add_action('admin_enqueue_scripts', 'copy_paste_styles_add_script');
