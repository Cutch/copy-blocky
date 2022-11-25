<?php

if (!defined('WP_UNINSTALL_PLUGIN')) {
  die;
}
delete_option('copy_paste_styles_options');
delete_site_option('copy_paste_styles_options');
