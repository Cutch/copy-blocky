<?php

if (!defined('WP_UNINSTALL_PLUGIN')) {
  die;
}
delete_option('copy_blocky_options');
delete_site_option('copy_blocky_options');
