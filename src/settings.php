<?php

/**
 * Add the javascript to the post.php page
 */
function copy_blocky_add_settings_script()
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
  wp_enqueue_script('copy_blocky_settings_script', $script_url, $script_asset['dependencies'], $script_asset['version'], true);
  wp_enqueue_style('copy_blocky_settings_css', plugins_url('css/settings.css', __FILE__));
}
add_action('admin_enqueue_scripts', 'copy_blocky_add_settings_script');


function copy_blocky_add_settings_page()
{
  add_options_page(
    __('Copy Blocky', 'copy-blocky'),
    __('Copy Blocky', 'copy-blocky'),
    'manage_options',
    __('Copy Blocky', 'copy-blocky'),
    'copy_blocky_render_settings_page'
  );
}
add_action('admin_menu', 'copy_blocky_add_settings_page');


function copy_blocky_render_settings_page()
{
?>
  <h2>Copy Blocky Settings</h2>
  <form action="options.php" method="post">
    <?php
    settings_fields('copy_blocky_options');
    do_settings_sections('copy_blocky'); ?>
    <input name="submit" class="button button-primary" type="submit" value="<?php esc_attr_e(__('Save', 'copy-blocky')); ?>" />
  </form>
<?php
}

function copy_blocky_register_settings()
{
  register_setting('copy_blocky_options', 'copy_blocky_options', 'copy_blocky_options_validate');
  add_settings_section('settings', __('Hotkeys', 'copy-blocky'), 'copy_blocky_section_text', 'copy_blocky');

  add_settings_field('copy_blocky_setting_hotkey', __('Paste Styles Hotkey', 'copy-blocky'), 'copy_blocky_setting_hotkey', 'copy_blocky', 'settings');
  add_settings_field('copy_blocky_setting_hotkey_modifier', null, 'copy_blocky_setting_hotkey_modifier', 'copy_blocky', 'settings');
  add_settings_field('copy_blocky_setting_hotkey_key', null, 'copy_blocky_setting_hotkey_key', 'copy_blocky', 'settings');

  $options = get_option('copy_blocky_options');
  if ($options === false) {
    update_option('copy_blocky_options', array('hotkey' => 'ctrl+shift+V', 'hotkeyModifier' => 'primaryShift', 'hotkeyKey' => 'V'));
  }
}
add_action('admin_init', 'copy_blocky_register_settings');


function copy_blocky_add_settings($hook)
{
  global $pagenow;

  if ('post.php' != $pagenow) {
    return;
  }

  $options = get_option('copy_blocky_options');
  echo '<script type="text/javascript">window.copyBlocky = ' . json_encode($options) . ';</script>';
}
add_action('admin_head', 'copy_blocky_add_settings');


function copy_blocky_options_validate($input)
{
  return $input;
}

function copy_blocky_section_text()
{
  echo __('Set the hotkey used for pasting styles.', 'copy-blocky');
}

function copy_blocky_setting_hotkey()
{
  $options = get_option('copy_blocky_options');
  echo "<input id='copy-blocky_setting_hotkey' onkeydown='copyBlocky.getKey(event)' name='copy_blocky_options[hotkey]' type='text' value='" . esc_attr($options['hotkey']) . "' />";
  echo "<div id='copy-blocky_setting_hotkey_error' class='cps__settings__error'></div>";
}
function copy_blocky_setting_hotkey_modifier()
{
  $options = get_option('copy_blocky_options');
  echo "<input id='copy-blocky_setting_hotkey_modifier' name='copy_blocky_options[hotkeyModifier]' type='hidden' value='" . esc_attr($options['hotkeyModifier']) . "' />";
}
function copy_blocky_setting_hotkey_key()
{
  $options = get_option('copy_blocky_options');
  echo "<input id='copy-blocky_setting_hotkey_key' name='copy_blocky_options[hotkeyKey]' type='hidden' value='" . esc_attr($options['hotkeyKey']) . "' />";
}
