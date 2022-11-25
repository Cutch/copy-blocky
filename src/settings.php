<?php

/**
 * Add the javascript to the post.php page
 */
function copy_paste_styles_add_settings_script()
{
  global $pagenow;

  if ('options-general.php' != $pagenow) {
    return;
  }

  $script_path       = 'js/settings.js';
  $script_asset_path = 'js/settings.asset.php';
  $script_asset      = include($script_asset_path);
  $script_asset = $script_asset ? $script_asset
    : array('dependencies' => array(), 'version' => filemtime($script_path));
  $script_url = plugins_url($script_path, __FILE__);
  wp_enqueue_script('copy_paste_styles_settings_script', $script_url, $script_asset['dependencies'], $script_asset['version'], true);
  wp_enqueue_style('copy_paste_styles_settings_css', plugins_url('css/settings.css', __FILE__));
}
add_action('admin_enqueue_scripts', 'copy_paste_styles_add_settings_script');


function add_settings_page()
{
  add_options_page('Copy Paste Styles', 'Copy Paste Styles', 'manage_options', 'Copy Paste Styles', 'render_copy_paste_styles_settings_page');
}
add_action('admin_menu', 'add_settings_page');


function render_copy_paste_styles_settings_page()
{
?>
  <h2>Copy Paste Styles Settings</h2>
  <form action="options.php" method="post">
    <?php
    settings_fields('copy_paste_styles_options');
    do_settings_sections('copy_paste_styles'); ?>
    <input name="submit" class="button button-primary" type="submit" value="<?php esc_attr_e('Save'); ?>" />
  </form>
<?php
}

function register_settings()
{
  register_setting('copy_paste_styles_options', 'copy_paste_styles_options', 'copy_paste_styles_options_validate');
  add_settings_section('settings', 'Hotkeys', 'copy_paste_styles_section_text', 'copy_paste_styles');

  add_settings_field('copy_paste_styles_setting_hotkey', 'Style Paste Hotkey', 'copy_paste_styles_setting_hotkey', 'copy_paste_styles', 'settings');
  add_settings_field('copy_paste_styles_setting_hotkey_modifier', null, 'copy_paste_styles_setting_hotkey_modifier', 'copy_paste_styles', 'settings');
  add_settings_field('copy_paste_styles_setting_hotkey_key', null, 'copy_paste_styles_setting_hotkey_key', 'copy_paste_styles', 'settings');

  $options = get_option('copy_paste_styles_options');
  if ($options === false) {
    update_option('copy_paste_styles_options', array('hotkey' => 'ctrl+shift+V', 'hotkeyModifier' => 'primaryShift', 'hotkeykey' => 'V'));
  }
}
add_action('admin_init', 'register_settings');


function copy_paste_styles_add_settings($hook)
{
  global $pagenow;

  if ('post.php' != $pagenow) {
    return;
  }

  $options = get_option('copy_paste_styles_options');
  echo '<script type="text/javascript">window.copyPasteStyles = ' . json_encode($options) . ';</script>';
}
add_action('admin_head', 'copy_paste_styles_add_settings');


function copy_paste_styles_options_validate($input)
{
  return $input;
}

function copy_paste_styles_section_text()
{
  echo 'Set the hotkey used for pasting styles.';
}

function copy_paste_styles_setting_hotkey()
{
  $options = get_option('copy_paste_styles_options');
  echo "<input id='copy-paste-styles_setting_hotkey' onkeydown='copyPasteStyles.getKey(event)' name='copy_paste_styles_options[hotkey]' type='text' value='" . esc_attr($options['hotkey']) . "' />";
  echo "<div id='copy-paste-styles_setting_hotkey_error' class='cps__settings__error'></div>";
}
function copy_paste_styles_setting_hotkey_modifier()
{
  $options = get_option('copy_paste_styles_options');
  echo "<input id='copy-paste-styles_setting_hotkey_modifier' name='copy_paste_styles_options[hotkeyModifier]' type='hidden' value='" . esc_attr($options['hotkeyModifier']) . "' />";
}
function copy_paste_styles_setting_hotkey_key()
{
  $options = get_option('copy_paste_styles_options');
  echo "<input id='copy-paste-styles_setting_hotkey_key' name='copy_paste_styles_options[hotkeyKey]' type='hidden' value='" . esc_attr($options['hotkeyKey']) . "' />";
}
